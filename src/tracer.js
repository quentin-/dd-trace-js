'use strict'

const platform = require('./platform')
const Tracer = require('./opentracing/tracer')
const ScopeManager = require('./scope/scope_manager')

class DatadogTracer extends Tracer {
  constructor (config) {
    super(config)

    this._context = platform.context(config)
    this._scopeManager = new ScopeManager()
  }

  trace (name, options, callback) {
    if (!callback) {
      callback = options
      options = {}
    }

    this._context.run(() => {
      const childOf = options.childOf !== undefined ? options.childOf : this._context.get('current')
      const defaultTags = {
        'service.name': options.service || this._service,
        'resource.name': options.resource || name
      }

      if (options.type) {
        defaultTags['span.type'] = options.type
      }

      const tags = Object.assign(defaultTags, options.tags)
      const span = this.startSpan(name, { childOf, tags })

      this._context.set('current', span)

      callback(span)
    })
  }

  scopeManager () {
    return this._scopeManager
  }

  startActiveScope (name, options, finishSpanOnClose) {
    options = Object.assign({}, options)
    options.childOf = options.childOf || this._scopeManager.active()
    options.tags = Object.assign({}, {
      'service.name': this._service,
      'resource.name': name
    }, options)

    const span = this._startSpan(name, options)
    const scope = this._scopeManager.activate(span, finishSpanOnClose)

    return scope
  }

  currentSpan () {
    return this._context.get('current') || null
  }

  bind (callback) {
    return this._context.bind(callback)
  }

  bindEmitter (emitter) {
    this._context.bindEmitter(emitter)
  }
}

module.exports = DatadogTracer
