'use strict'

class Context {
  constructor () {
    this._parent = null
    this._count = 0
    this._id = Math.random()
  }

  retain () {
    this._count++
    // require('fs').writeSync(1, `${this._id} (context.retain) ${this._count}\n`)
  }

  release () {
    this._count--
    // require('fs').writeSync(1, `${this._id} (context.release) ${this._count}\n`)
    this._destroy()
  }

  parent () {
    return this._parent
  }

  link (parent) {
    // require('fs').writeSync(1, `${this._id} (context.link - ${parent})\n`)
    this._parent = parent
    this._parent.attach(this)
  }

  unlink () {
    // require('fs').writeSync(1, `${this._id} (context.unlink)\n`)

    this._parent.detach(this)
    this._parent = null
  }

  relink (parent) {
    // require('fs').writeSync(1, `${this._id} (context.relink - ${parent})\n`)
    this.unlink()
    this.link(parent)
  }

  _destroy () {
    if (this._count === 0) {
      // require('fs').writeSync(1, `${this._id}\n`)
      this.unlink()
    }
  }
}

module.exports = Context
