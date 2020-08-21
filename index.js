const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const Person = require('./models/persons');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
const morgan = require('morgan');

morgan.token('data', (request) => JSON.stringify(request.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data'),
);

app.get('/persons', (request, response) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get('/info', (request, response) => {
  Person.find({})
    .then((result) => {
      response.send(
        `<div>
    <p>Phonebook has info for ${result.length} persons.</p>
    <p>${new Date()}</p>
      </div>`,
      );
    })
    .catch((error) => next(error));
});

app.get('/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  Person.findById(id).then((p) => {
    response.json(p);
  });
});

app.delete('/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then((updatedPerson) => updatedPerson.json())

    .catch((error) => next(error));
});

app.post('/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'Name missing',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Number missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

/*const unknownEndpoint = (request, result) => {
  res.status(404).send({error: 'Unable to retrieve data.'});
};

app.use(unknownEndpoint);

const errorHandler = (error, request, result, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return res.status(400).send({error: 'Malformed id.'});
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({error: error.message});
  }
  next(error);
};

app.use(errorHandler);*/

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
