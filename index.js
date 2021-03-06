const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const process = require('process')

const Person = require('./models/persons')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
const morgan = require('morgan')

morgan.token('data', (request) => JSON.stringify(request.body))

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data'),
)

app.get('/persons', (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.json(result)
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.send(
        `<div>
    <p>Phonebook has info for ${result.length} persons.</p>
    <p>${new Date()}</p>
      </div>`,
      )
    })
    .catch((error) => next(error))
})

app.get('/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((p) => {
      if (p) {
        response.json(p.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.put('/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      response.json(updatedPerson.toJSON())
    })

    .catch((error) => next(error))
})

app.post('/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Content missing!',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((result) => result.toJSON())
    .then((formatedResult) => response.json(formatedResult))
    .catch((error) => next(error))
})

const errorHandler = (error, request, result, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return result.status(400).send({error: 'Malformed id.'})
  } else if (error.name === 'ValidationError') {
    return result.status(400).json({error: error.message})
  }
  next(error)
}
 
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
