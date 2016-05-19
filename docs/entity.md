# Entity

EventSourced Entity Class.

This class combines Event Sourcing and CQRS concepts with an event emitter.
We are doing so through composition at the class level using Symbols to
hide some of the complexity and keep the instances as clean as possible.

-   Event sourcing attributes are referenced through this[es].\*
-   CQRS attributes (commands for now) are referenced through this[cqrs].\*
-   The Event Emitter is referenced through this[emitter].\*

One of the main goals of this class is to create instances that are as clean
as possible and allow users to set and get attributes as they normally would
in JavaScript while automatically maintaining state, event history, etc. This
is why we use Symbols to store internals.

## apply

Apply an event to the entity.

Take an event as expected by this library and apply it to the entity. If it
is a snapshot event, reset the state to be an empty object.

**Parameters**

-   `event` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The event being applied.
-   `target` **Entity** The entity being acted on.

## getMethodsOf

Get a list of commands defined on the entity.

**Parameters**

-   `entity` **Entity** The entity being acted on.

## getRegisteredCommandsOf

Get a list of registered commands from an entity instance.

**Parameters**

-   `entity` **Entity** The entity being acted on.

## inspect

Inspect an Entity object.

Because we are using symbols to hide some internals, inspecting an instance
through common means is not possible. This makes it easy to access
important information about the entity.

**Parameters**

-   `target` **Entity** The entity being acted on.
-   `entity`  

## registerCommand

Register a command. Here we take a function and register it under the CQRS
property in the target using the passed command name. Additionaly, the
function is wrapped so the following happens:

1.  The state of the entity BEFORE executing the function is held in memory.
2.  The VALUE returned by the function is held in memory.
3.  The state AFTER executing the function ir held in memory.
4.  The before and after states are compared by way of diff.
5.  If the function has any effect on state AND returns null or undefined,
    we create, apply, record and emit an event.

**Parameters**

-   `target` **Entity** The entity the command is being registered on.
-   `command` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the commmand being registered.
-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The function being registered.

## registerCommands

Get a list of registered commands from an entity instance.

**Parameters**

-   `entity` **Entity** The entity being acted on.

## snapshot

Create a snapshot of an entity.

Here we return an immutable diff using an empty object as base and the
current state of the entity. This essentially gives us a patch that can be
applied like any other changeset except the expectation is that it will be
applied to an empty object.

**Parameters**

-   `entity` **Entity** The entity being snapshotted.

# conf

These symbols are used as keys for some "private" properties in Entity.

# traps

We use a Proxy to trap certain operations so Entity works as expected:

1.  We trap every get operation to check if the operation refers to a command
    and, if so, we route it to the registered CQRS commands.
2.  We trap set operations to ensure state is kept to par with the entity
    instance's data.
