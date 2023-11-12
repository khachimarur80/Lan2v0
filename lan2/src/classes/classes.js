
class Lan {
  constructor(name, location) {
    this.name = name
    this.location = location
    this.showing =  'board'
    this.concepts =  []
    this.relations =  []
    this.categories =  []
    this.statements = []
    this.conditions =  []
    this.actions =  []
    this.selectingArea =  false
    this.drawer =  false
    this.loaded =  false
    this.contents =  []
    this.zoomVal =  1
    this.objectType =  null
    this.contentType =  null
  }
}

class Category {
  constructor(name) {
    this.objectType = 'category'
    this.name = name
    this.id = Math.floor(Math.random()*100000)
    this.objects = []
  }
}

class Concept {
  constructor() {
    this.objectType = 'concept'
    this.name = ''
    this.id = Math.floor(Math.random()*100000)
    this.data = 'file'
    this.contents = null

    //Board values
    this.x = 0
    this.y = 0

    //Attributes for easier parsing
    this.relations = []
    this.categories = []
  }
}

class Relation {
  constructor() {
    this.objectType = 'relation'
    this.name = ''
    this.id = Math.floor(Math.random()*100000)
    this.subject = null
    this.object = null
    this.offsetX1 = 0
    this.offsetX2 = 0
    this.offsetY1 = 0
    this.offsetY2 = 0

    //Attributes for easier parsing
    this.categories = []
  }
}

class Action {
  constructor() {
    this.objectType = 'action'
    this.id = Math.floor(Math.random()*100000)
    this.name = '#'+this.id.toString()
    this.condition = null

    //Board values
    this.x = 100
    this.y = 100

    this.offsetX = 0
    this.offsetY = 0
  }
}

class Condition {
  constructor() {
    this.objectType = 'condition'
    this.id = Math.floor(Math.random()*100000)
    this.name = '#'+this.id.toString()
    this.items = []

    //Board values
    this.x = 100
    this.y = 100

    this.statementOffsetX = 0
    this.statementOffsetY = 0

    this.actionOffsetX = 0
    this.actionOffsetY = 0
  }
}

class Statement {
  constructor(type) {
    this.objectType = 'statement'
    this.id = Math.floor(Math.random()*100000)
    this.name = '#'+this.id.toString()
    this.type = type
    this.items = []

    //Board values
    this.x = 100
    this.y = 100

    this.offsetX = 0
    this.offsetY = 0
  }
}

class Line {
  constructor() {
    this.contents = ''
    this.type = 'body'
    this.divisions = []
  }
}

class Tab {
  constructor() {
    this.name = ''
    this.path = ''
    this.contents = []
    this.active = false
  }
}

export { Lan, Category, Concept, Relation, Action, Condition, Statement, Line, Tab };