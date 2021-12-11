require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()
const app2 = express()

app.use(express.json())
app2.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('oma', function getBody (req) {
	if (JSON.stringify(req.body).length > 2) return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :oma'))

let persons = [
	{
	"name": "Arto Hellas",
	"number": "040-123456",
	"id": 1
	},
	{
	"name": "Ada Lovelace",
	"number": "39-44-5323523",
	"id": 2
	},
	{
	"name": "Dan Abramov",
	"number": "12-43-234345",
	"id": 3
	},
	{
	"name": "Mary Poppendieck",
	"number": "39-23-6423122",
	"id": 4
	}
]

/*
app.get('/api/persons', (req, res) => {
	res.json(persons)
  })
*/
app.get('/api/persons', (req, res) => {
	Person.find({}).then(p => {
	  res.json(p)
	})
})

/*
app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id)
	const person = persons.find(person => person.id === id)

	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}

})
*/
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
		.then(p => {
			if (p) {
				res.json(p)
			} else {
				res.status(404).end()
			}
  	})
		.catch(error => next(error))
})

/*
const generateId = () => {
	return (Math.random() * 10000) | 0
}

app.post('/api/persons', (req, res) => {
  const body = req.body

	if (persons.find(p => p.name === body.name)) {
		return res.status(400).json({
			error: 'name must be unique'
		})
	}

  if ((!body.name) || (!body.number)) {
    return res.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)
  
  res.json(person)
})
*/
app.post('/api/persons', (req, res, next) => {
	const body = req.body
  
	const person = new Person({
		name: body.name,
		number: body.number,
	})
  
	person
		.save()
		.then(savedPerson => savedPerson.toJSON())
		.then(savedAndFormattedPerson => {
			res.json(savedAndFormattedPerson)
	})
	.catch(error => next(error))
})

/*
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})
*/
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then(updatedPerson => {
			res.json(updatedPerson)
		})
		.catch(error => next(error)) 
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

/*
app2.get('/info', (req, res) => {
	const sum = persons.length
	const date = new Date()
	res.send(`<div>Phonebook has info for ${sum} people</div><div>${date}</div>`)
})
*/
app2.get('/info', (req, res) => {
	Person.count({}, function( err, count){
		const date = new Date()
		res.send(`<div>Phonebook has info for ${count} people</div><div>${date}</div>`)
		})
})

const PORT2 = 3003
app2.listen(PORT2, () => {
  console.log(`Server running on port ${PORT2}`)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	}

  next(error)
}

app.use(errorHandler)