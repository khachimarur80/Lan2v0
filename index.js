//The Structure Backend Classes
class Concept {
	constructor() {
		this.name = ''
		this.id = Math.floor(Math.random()*100000)
		this.info = 'Text file, Image file or API ...'

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
		this.name = ''
		this.id = Math.floor(Math.random()*100000)
		this.subject = null
		this.object = null
		this.offsetX = 0
		this.offsetY = 0

		//Attributes for easier parsing
		this.categories = []
	}
}
class Category {
	constructor(name) {
		this.name = name
		this.id = Math.floor(Math.random()*100000)
		this.objects = []
	}
}
class Statement {
	constructor(type) {
		this.id = Math.floor(Math.random()*100000)
		this.type = type
		this.items = []

		//Board values
		this.x = 100
		this.y = 100
	}
}
class Condition {
	constructor() {
		this.id = Math.floor(Math.random()*100000)
		this.items = []

		//Board values
		this.x = 100
		this.y = 100
	}
}
class Action {
	constructor() {
		this.id = Math.floor(Math.random()*100000)
		this.condition = null
		this.name = ''

		//Board values
		this.x = 100
		this.y = 100
	}
}

const app = Vue.createApp({
    data() {
        return {
            concepts: [],
            relations: [],
            categories: [],
            statements: [],
            conditions: [],
            actions: [],
            creatingRelation: [],
            creatingCondition: [],
            creatingAction: [],
            focusedItem: null,
            rectangle: null,
            selectingArea: false,
            addTagFlag: false,
            addingTag: '',
            showing: 'board',
            selectedQuery: null,
            drawer: false,
        };
    },
    methods: {
    	addTag(object) {
    		let category;
    		for (let i=0; i<this.categories.length; i++) {
    			if (this.categories[i].name==this.addingTag) {
    				category = this.categories[i]
    				break
    			}
    		}
    		if (category) {
    			category.objects.push(object.id)
    			object.categories.push(category)
    		}
    		else {
    			let category = new Category(this.addingTag)
    			category.objects.push(object.id)
    			object.categories.push(category)

    			this.categories.push(category)
    		}
    		this.addTagFlag = false
    		this.addingTag = ''
    	},
    	addAction() {
    		let action = new Action()
    		action.x = 100
    		action.y = 100

    		this.actions.push(action)

    		this.$nextTick(()=>{
				if (this.$refs.action) {
					this.$refs.action.forEach((actionElement) => {
						this.dragConcept(actionElement)
					})
				}
			})
    	},
    	functionMouseDown(event) {
    		event.preventDefault()
    		if (event.target.id=="generalFunctionsSVG") {
	    		let condition = new Condition()
	    		condition.x = event.x - event.target.getBoundingClientRect().left
	    		condition.y = event.y - event.target.getBoundingClientRect().top

	    		this.conditions.push(condition)

	    		this.$nextTick(()=>{
					if (this.$refs.condition) {
						this.$refs.condition.forEach((conditionElement) => {
							this.dragConcept(conditionElement)
						})
					}
				})
		    }
    	},
    	createStatement(type) {
    		let statement = new Statement(type)
    		this.statements.push(statement)

    		if (type=='[]') {
    			statement.items = [['tag', '']]
    		}
    		if (type=='#') {
    			statement.items = [['concept', '']]
    		}
    		if (type=='[]--[]') {
    			statement.items = [['concept', ''],['relation', ''],['concept', '']]
    		}
    		if (type=='#--[]') {
    			statement.items = [['tag', ''],['relation', ''],['concept', '']]
    		}
    		if (type=='#--#') {
    			statement.items = [['tag', ''],['relation', ''],['tag', '']]
    		}

    		this.$nextTick(()=>{
				if (this.$refs.statement) {
					this.$refs.statement.forEach((statementElement) => {
						this.dragConcept(statementElement)
					})
				}
			})
    	},
    	focusItem(item) {
    		this.focusedItem = item
    	},
    	getObjectById(id) {
    		for(let i=0; i<this.concepts.length; i++) {
 				if (this.concepts[i].id==id) {
 					return this.concepts[i]
 				}
 			}
 			for(let i=0; i<this.statements.length; i++) {
 				if (this.statements[i].id==id) {
 					return this.statements[i]
 				}
 			}
 			for(let i=0; i<this.actions.length; i++) {
 				if (this.actions[i].id==id) {
 					return this.actions[i]
 				}
 			}
 			for(let i=0; i<this.conditions.length; i++) {
 				if (this.conditions[i].id==id) {
 					return this.conditions[i]
 				}
 			}
 			for(let i=0; i<this.relations.length; i++) {
 				if (this.relations[i].id==id) {
 					return this.relations[i]
 				}
 			}
    	},
    	boardMouseDown(event) {
    		if (event.target.id=="generalSVG") {
	    		if (this.focusedItem) {
	    			this.focusedItem = null
	    		}
	    		else if (this.selectingArea) {
	    			let mapRect = document.getElementById('board').getBoundingClientRect()
	    			this.initialX = event.clientX - mapRect.left;
					this.initialY = event.clientY - mapRect.top;
					this.rectangle = {
				        left: this.initialX + 'px',
				        top: this.initialY + 'px',
				        width: '0px',
				        height: '0px',
		     		};
	    		}
	    		else {
		    		let concept = new Concept()
		    		concept.x = event.x - event.target.getBoundingClientRect().left
		    		concept.y = event.y - event.target.getBoundingClientRect().top

		    		this.concepts.push(concept)

		    		this.$nextTick(()=>{
						if (this.$refs.concept) {
							this.$refs.concept.forEach((conceptElement) => {
								this.dragConcept(conceptElement)
							})
						}
					})
		    	}
		    }
    	},
    	functionMouseMove(event) {
    		if (this.creatingCondition[0]) {
				const functions = document.getElementById('functions').getBoundingClientRect()
				if (document.getElementById('creating-condition-line')) {
					let line = document.getElementById('creating-condition-line');
					line.setAttributeNS(null, 'x2', event.x - functions.left);
					line.setAttributeNS(null, 'y2', event.y - functions.top);
				}
				else {
					let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
					line.id = 'creating-condition-line'
					let origin = document.querySelector('[data-id="'+this.creatingCondition[0][0].id+'"]').getBoundingClientRect()
					line.setAttributeNS(null, 'x1', origin.left + origin.width - functions.left + this.creatingCondition[0][1].x);
					line.setAttributeNS(null, 'y1', origin.top + origin.height/2 - functions.top + this.creatingCondition[0][1].y);
					line.setAttributeNS(null, 'x2', event.x - functions.left);
					line.setAttributeNS(null, 'y2', event.y - functions.top);
					line.setAttributeNS(null, 'stroke', 'white');
					line.setAttributeNS(null, 'stroke-width', '1');

					document.getElementById('generalFunctionsSVG').appendChild(line)
				}
			}
			else if (this.creatingAction[0]) {
				const functions = document.getElementById('functions').getBoundingClientRect()
				if (document.getElementById('creating-action-line')) {
					let line = document.getElementById('creating-action-line');
					line.setAttributeNS(null, 'x2', event.x - functions.left);
					line.setAttributeNS(null, 'y2', event.y - functions.top);
				}
				else {
					let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
					line.id = 'creating-action-line'
					let origin = document.querySelector('[data-id="'+this.creatingAction[0][0].id+'"]').getBoundingClientRect()
					line.setAttributeNS(null, 'x1', origin.left + origin.width/2 - functions.left + this.creatingAction[0][1].x);
					line.setAttributeNS(null, 'y1', origin.top + origin.height - functions.top + this.creatingAction[0][1].y);
					line.setAttributeNS(null, 'x2', event.x - functions.left);
					line.setAttributeNS(null, 'y2', event.y - functions.top);
					line.setAttributeNS(null, 'stroke', 'white');
					line.setAttributeNS(null, 'stroke-width', '1');

					document.getElementById('generalFunctionsSVG').appendChild(line)
				}
			}
    	},
    	dragConcept(word) {
			const vm = this;
			var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
			var wordObj = this.getObjectById(word.getAttribute('data-id'))
			var original = [parseInt(wordObj.x), parseInt(wordObj.y)];
		
			word.onmousedown = dragMouseDown;

			function dragMouseDown(e) {
				e.stopPropagation()
				var wordObj = vm.getObjectById(word.getAttribute('data-id'))

				e = e || window.event;
				e.preventDefault();
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				document.onmousemove = elementDrag;
			}

			function elementDrag(e) {
				var wordObj = vm.getObjectById(word.getAttribute('data-id'))

				e = e || window.event;
				e.preventDefault();

				var rect = word.getBoundingClientRect();

				pos1 = pos3 - (e.clientX);
				pos2 = pos4 - (e.clientY);
				pos3 = e.clientX;
				pos4 = e.clientY;

				wordObj.y = (word.offsetTop - pos2)
				wordObj.x = (word.offsetLeft - pos1)

				if (vm.hoveringBox(word)) {
					word.classList.add('hovering')
					word.setAttribute('data-hover', vm.hoveringBox(word).getAttribute('data-id'))
				}
				else {
					word.classList.remove('hovering')
				}
			}

			function closeDragElement() {
				document.onmouseup = null;
				document.onmousemove = null;

				if (word.classList.contains('hovering')) {
					wordObj.x = original[0]
					wordObj.y = original[1]

					if (vm.getWordById(word.getAttribute('data-hover'))) {
						var word1 = vm.getWordById(word.getAttribute('data-hover'))
					}
					/*else {
						var word1 = vm.getGroupById(word.getAttribute('data-hover'))
					}*/

					var connection = new Connection()
					connection.word1 = wordObj
					connection.word2 = word1
					vm.currentGroup.connections.push(connection)

					word.setAttribute('data-hover', '')
					word.classList.remove('hovering')
				}
				else {
					original = [wordObj.x, wordObj.y];
				}
			}
		},
		hoveringBox(element) {
			var rect1 = element.getBoundingClientRect();

			if (element.getAttribute("data-id")) {
				var elements = document.querySelectorAll('.wordObj:not([data-id="'+element.getAttribute("data-id")+'"] .wordObj)');
			}
			else {
				var elements = document.querySelectorAll('.wordObj')
			}

			for (let i = 0; i < elements.length; i++) {
				var element2 = elements[i];
				if (element2 === element) {
			  		continue;
				}
				var rect2 = element2.getBoundingClientRect();
				var overlaps = !(
					rect1.right < rect2.left ||
					rect1.left > rect2.right ||
					rect1.bottom < rect2.top ||
					rect1.top > rect2.bottom
				);
				if (overlaps) {
					return element2;
				}
			}
			return null;
		},
		createAction(event) {
			let element = event.target

			let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

			if (!this.creatingAction[0]) {
				let coords
				if (event.target.parentElement.classList[1]=='right') {
					coords = {'x': 18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='left') {
					coords = {'x': -18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='up') {
					coords = {'x': -.5, 'y': -9}
				}
				else if (event.target.parentElement.classList[1]=='down') {
					coords = {'x': -.5, 'y': 9}
				}
				else {
					coords = {'x': 0, 'y': 0}
				}

				element.parentElement.classList.add('relation-node')
				this.creatingAction.push([conceptTarget, coords])
			}
			else {
				let coords
				if (event.target.parentElement.classList[1]=='right') {
					coords = {'x': 18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='left') {
					coords = {'x': -18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='up') {
					coords = {'x': -.5, 'y': -9}
				}
				else if (event.target.parentElement.classList[1]=='down') {
					coords = {'x': -.5, 'y': 9}
				}
				else {
					coords = {'x': 0, 'y': 0}
				}

				element.parentElement.classList.add('relation-node')
				conceptTarget.condition = this.creatingAction[0]

				let line = document.getElementById('creating-action-line');
				line.remove()

				this.creatingAction = []
			}
		},
		createCondition(event) {
			let element = event.target
			let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

			if (!this.creatingCondition[0]) {
				let coords
				if (event.target.parentElement.classList[1]=='right') {
					coords = {'x': 18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='left') {
					coords = {'x': -18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='up') {
					coords = {'x': -.5, 'y': -9}
				}
				else if (event.target.parentElement.classList[1]=='down') {
					coords = {'x': -.5, 'y': 9}
				}
				else {
					coords = {'x': 0, 'y': 0}
				}

				element.parentElement.classList.add('relation-node')
				this.creatingCondition.push([conceptTarget, coords])
			}
			else {
				let coords
				if (event.target.parentElement.classList[1]=='right') {
					coords = {'x': 18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='left') {
					coords = {'x': -18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='up') {
					coords = {'x': -.5, 'y': -9}
				}
				else if (event.target.parentElement.classList[1]=='down') {
					coords = {'x': -.5, 'y': 9}
				}
				else {
					coords = {'x': 0, 'y': 0}
				}

				element.parentElement.classList.add('relation-node')

				conceptTarget.items.push([this.creatingCondition[0], false])
				conceptTarget.items.push(['and', true])

				let line = document.getElementById('creating-condition-line');
				line.remove()

				this.creatingCondition = []
			}
		},
		createRelation(event) {
			let element = event.target
			let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

			if (!this.creatingRelation[0]) {
				let coords
				if (event.target.parentElement.classList[1]=='right') {
					coords = {'x': 18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='left') {
					coords = {'x': -18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='up') {
					coords = {'x': -.5, 'y': -9}
				}
				else if (event.target.parentElement.classList[1]=='down') {
					coords = {'x': -.5, 'y': 9}
				}

				element.parentElement.classList.add('relation-node')
				this.creatingRelation.push([conceptTarget, coords])
			}
			else {
				let coords
				if (event.target.parentElement.classList[1]=='right') {
					coords = {'x': 18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='left') {
					coords = {'x': -18, 'y': 1}
				}
				else if (event.target.parentElement.classList[1]=='up') {
					coords = {'x': -.5, 'y': -9}
				}
				else if (event.target.parentElement.classList[1]=='down') {
					coords = {'x': -.5, 'y': 9}
				}

				element.parentElement.classList.add('relation-node')
				this.creatingRelation.push([conceptTarget, coords])
				let relation = new Relation()
				relation.object = this.creatingRelation[0][0]
				relation.subject = this.creatingRelation[1][0]

				relation.object = this.creatingRelation[0][0]
				relation.subject = this.creatingRelation[1][0]
				relation.offsetX1 = this.creatingRelation[0][1].x
				relation.offsetY1 = this.creatingRelation[0][1].y
				relation.offsetX2 = this.creatingRelation[1][1].x
				relation.offsetY2 = this.creatingRelation[1][1].y

				let line = document.getElementById('creating-relation-line');
				line.remove()

				this.relations.push(relation)

				this.creatingRelation = []
			}
		},
		boardMouseMove(event) {
			if (this.creatingRelation[0]) {
				const board = document.getElementById('board').getBoundingClientRect()
				if (document.getElementById('creating-relation-line')) {
					let line = document.getElementById('creating-relation-line');
					let board = document.getElementById('board').getBoundingClientRect()
					line.setAttributeNS(null, 'x2', event.x + board.left - 60);
					line.setAttributeNS(null, 'y2', event.y - board.top);
				}
				else {
					let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
					line.id = 'creating-relation-line'
					let origin = document.querySelector('[data-id="'+this.creatingRelation[0][0].id+'"]').getBoundingClientRect()
					let board = document.getElementById('board').getBoundingClientRect()
					line.setAttributeNS(null, 'x1', origin.left + origin.width/2 - board.left + this.creatingRelation[0][1].x);
					line.setAttributeNS(null, 'y1', origin.top + origin.height/2 - board.top + this.creatingRelation[0][1].y);
					line.setAttributeNS(null, 'x2', event.x);
					line.setAttributeNS(null, 'y2', event.y);
					line.setAttributeNS(null, 'stroke', 'white');
					line.setAttributeNS(null, 'stroke-width', '1');

					document.getElementById('generalSVG').appendChild(line)
				}
			}
			if (this.rectangle) {
				let mapRect = document.getElementById('board').getBoundingClientRect()
		        const width = event.clientX - this.initialX - mapRect.left;
		        const height = event.clientY - this.initialY - mapRect.top;
		        this.rectangle.width = Math.abs(width) + 'px';
		        this.rectangle.height = Math.abs(height) + 'px';
		        this.rectangle.left = width < 0 ? event.clientX - mapRect.left + 'px' : this.initialX + 'px';
		        this.rectangle.top = height < 0 ? event.clientY - mapRect.top + 'px' : this.initialY + 'px';
		    }
		},
		boardMouseUp(event) {
			this.rectangle = null;
		}
    },
});

const Neon = Vuetify.ThemeDefinition = {
  dark: true,
  colors: {
    background: '#000000', // Dark background
    surface: '#111111', // Slightly lighter surface color
    primary: '#03d8f4', // Light electric blue
    secondary: '#00E5FF', // Lighter secondary color
    error: '#FF4081', // Neon pink for errors
    info: '#4CAF50', // Neon green for info
    success: '#FFD600', // Neon yellow for success
    warning: '#FF6D00', // Neon orange for warnings
  },
}
const Paper = Vuetify.ThemeDefinition = {
  dark: false, // Light theme for a paper-like feel
  colors: {
   	background: '#FDF5E6', // A warm beige for the background, similar to paper
    surface: '#D2B48C', // A warm brown, similar to wood
    primary: '#FFA500', // An orange tone for primary
    secondary: '#FFD700', // A lighter yellow-orange for secondary
    error: '#FF6B6B', // A soft red for errors
    info: '#FFD700', // A light yellow for info
    success: '#8FBC8F', // A muted green for success
    warning: '#FFA500', // The same orange tone for warnings as primary
  },
}


const vuetify = Vuetify.createVuetify({
  	theme: {
	  	defaultTheme: 'dark',
	    themes: {
			light: {
				colors: {
					primary: '#4285F4', // Google Blue
					secondary: '#202124', // Google Grey
					accent: '#FF5722', // Google Red
					error: '#F44336', // Google Red
					info: '#2196F3', // Google Blue
					success: '#4CAF50', // Google Green
					warning: '#FFC107', // Google Yellow
				},
			},
			dark: {
				colors: {
					primary: '#4285F4', // Google Blue
					secondary: '#202124', // Google Grey
					accent: '#FF5722', // Google Red
					error: '#F44336', // Google Red
					info: '#2196F3', // Google Blue
					success: '#4CAF50', // Google Green
					warning: '#FFC107', // Google Yellow
				},
			},
			Neon,
			Paper
	    },
  	},
  	options: {
    	customProperties: true,
   	}
})

app.use(vuetify);

app.mount('#app');