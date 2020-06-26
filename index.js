const express = require('express');
const app = express();
app.use(express.json());
const morgan = require('morgan');

morgan.token('data', (request) => JSON.stringify(request.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data'),
);
let persons = [
  {
    name: 'Arto Hellas',
    number: '74520-4523-452',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  response.send(
    `<div>
  <p>Phonebook has info for ${persons.length} persons.</p>
  <p>${new Date()}</p>
    </div>`,
  );
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => Math.floor(Math.random() * 1000000);

app.post('/api/persons', (request, response) => {
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

  if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({
      error: `${body.name} already exist in the phonebook`,
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
