# Event Sourced

[![Build Status](https://travis-ci.org/lgomez/eventsourced.svg?branch=master)](https://travis-ci.org/lgomez/eventsourced)
An Event Sourcing library for Node using ES6, Immutable, NLP and some CQRS.

Combining Event Sourcing and CQRS concepts in one Entity class for node using ES6 Symbols, Proxies, Immutable and Event Emitter. One of my main goals with the Entity class is to create instances that are as clean as possible and allow users to set and get attributes as they normally would in JavaScript while automatically maintaining state, event history, etc.

This is very much a work in progress and not ready for use. For now, see [lib/entity/entity.spec.js](lib/entity/entity.spec.js) to get an idea of what it does.
