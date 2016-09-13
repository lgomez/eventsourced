# eventsourced/entity

[lib/entity/entity.js:26-26](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L26-L26 "Source code on GitHub")

**Meta**

-   **author**: Luis G. Gomez &lt;lgomez@gmail.com>
-   **license**: Copyright (c) 2016 Luis G. Gomez.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

# conf

[lib/entity/entity.js:115-115](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L115-L115 "Source code on GitHub")

# traps

[lib/entity/entity.js:53-68](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L53-L68 "Source code on GitHub")

We use a Proxy to trap certain operations so Entity works as expected:

1.  We trap every get operation to check if the operation refers to a command
    and, if so, we route it to the registered CQRS commands.
2.  We trap set operations to ensure state is kept to par with the entity
    instance's data.

# Entity

[lib/entity/entity.js:112-300](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L112-L300 "Source code on GitHub")

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

**Parameters**

-   `events` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))** One or more events to apply to the entity.
-   `config` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Entity configuration object.
    -   `config.mappings` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** `command<->event` mapping overrides.

**Examples**

```javascript
class TestEntity extends Entity {
    rename(name) {
      this.name = name
    }
    save() {
      this.foo = 'bar'
    }
    touch() {
    }
    myQuery() {
      return {
        type: 'query response',
        name: this.name,
        email: this.email,
      }
    }
  }

  // Instantiate
  const instance = new TestEntity()
```

Returns **[Entity](#entity)** 

## getMethodsOf

[lib/entity/entity.js:157-162](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L157-L162 "Source code on GitHub")

Get a list of commands defined on the entity.

**Parameters**

-   `entity` **[Entity](#entity)** The entity being acted on.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** 

## getRegisteredCommandsOf

[lib/entity/entity.js:171-173](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L171-L173 "Source code on GitHub")

Get a list of registered commands from an entity instance.

**Parameters**

-   `entity` **[Entity](#entity)** The entity being acted on.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of registered command names.

## registerCommands

[lib/entity/entity.js:182-188](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L182-L188 "Source code on GitHub")

Register all methods of class as commands.

**Parameters**

-   `entity` **[Entity](#entity)** The entity being acted on.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of registered command names.

## registerCommand

[lib/entity/entity.js:212-234](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L212-L234 "Source code on GitHub")

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

-   `target` **[Entity](#entity)** The entity the command is being registered on.
-   `command` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the commmand being registered.
-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The function being registered.

**Examples**

```javascript
Entity.registerCommand(i, 'fix', function cmd() {
  this.fixed = true
})
```

Returns **[Null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)** 

## snapshot

[lib/entity/entity.js:248-256](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L248-L256 "Source code on GitHub")

Create a snapshot of an entity.

Here we return an immutable diff using an empty object as base and the
current state of the entity. This essentially gives us a patch that can be
applied like any other changeset except the expectation is that it will be
applied to an empty object.

**Parameters**

-   `entity` **[Entity](#entity)** The entity being snapshotted.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A simple object representation of this entity.

## apply

[lib/entity/entity.js:269-277](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L269-L277 "Source code on GitHub")

Apply an event to the entity.

Take an event as expected by this library and apply it to the entity. If it
is a snapshot event, reset the state to be an empty object.

**Parameters**

-   `event` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The event being applied.
-   `target` **[Entity](#entity)** The entity being acted on.

Returns **[undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)** 

## inspect

[lib/entity/entity.js:292-299](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L292-L299 "Source code on GitHub")

Inspect an Entity object.

Because we are using symbols to hide some internals, inspecting an instance
through common means is not possible. This makes it easy to access
important information about the entity.

**Parameters**

-   `target` **[Entity](#entity)** The entity being acted on.
-   `entity`  

**Examples**

```javascript
Entity.inspect(instance)
```

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A simple object with various data points about the entity.

# es

[lib/entity/entity.js:118-118](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L118-L118 "Source code on GitHub")

# emitter

[lib/entity/entity.js:125-125](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L125-L125 "Source code on GitHub")

# cqrs

[lib/entity/entity.js:128-128](https://github.com/lgomez/eventsourced/blob/7674b7063b6d517b55aae3d3288c0e5e5a0766de/lib/entity/entity.js#L128-L128 "Source code on GitHub")
