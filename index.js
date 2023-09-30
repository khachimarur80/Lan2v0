//The Structure Backend Classes
class Concept {
	constructor() {
		this.name = ''
		this.id = Math.floor(Math.random()*100000)

		//Board values
		this.x = 0
		this.y = 0

		//Attributes for easier parsing
		this.relations = []
	}
}
class Relation {
	constructor() {
		this.name = ''
		this.id = Math.floor(Math.random()*100000)
		this.subject = null
		this.object = null
	}
}
class Category {
	constructor() {
		this.name = ''
		this.id = Math.floor(Math.random()*100000)
		this.objects = []
	}
}
class Statement {
	constructor(elements) {
		this.id = Math.floor(Math.random()*100000)
		this.elements = elements
	}
}
class Condition {
	constructor() {

	}
}
class Action {
	constructor() {

	}
}

const app = Vue.createApp({
    data() {
        return {
            concepts: [],
            relations: [],
            categories: [],
            creatingRelation: [],
            focusedConcept: null,
            rectangle: null,
            selectingArea: false,
        };
    },
    methods: {
    	focusConcept(concept) {
    		this.focusedConcept = concept
    	},
    	getConceptById(id) {
    		for(let i=0; i<this.concepts.length; i++) {
 				if (this.concepts[i].id==id) {
 					return this.concepts[i]
 				}
 			}
    	},
    	boardMouseDown(event) {
    		if (event.target.id=="generalSVG") {
	    		if (this.focusedConcept) {
	    			this.focusedConcept = null
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
    	dragConcept(word) {
			const vm = this;
			var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
			var wordObj = this.getConceptById(word.getAttribute('data-id'))
			var original = [parseInt(wordObj.x), parseInt(wordObj.y)];
		
			word.onmousedown = dragMouseDown;

			function dragMouseDown(e) {
				e.stopPropagation()
				var wordObj = vm.getConceptById(word.getAttribute('data-id'))

				e = e || window.event;
				e.preventDefault();
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				document.onmousemove = elementDrag;
			}

			function elementDrag(e) {
				var wordObj = vm.getConceptById(word.getAttribute('data-id'))

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
		createRelation(event) {
			let element = event.target
			let conceptTarget = this.getConceptById(element.parentElement.parentElement.getAttribute('data-id'))

			if (!this.creatingRelation[0]) {
				element.parentElement.classList.add('relation-node')
				this.creatingRelation.push(conceptTarget)
			}
			else {
				element.parentElement.classList.add('relation-node')
				this.creatingRelation.push(conceptTarget)
				let relation = new Relation()
				relation.object = this.creatingRelation[0]
				relation.subject = this.creatingRelation[1]

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
					line.setAttributeNS(null, 'x2', event.x);
					line.setAttributeNS(null, 'y2', event.y);
				}
				else {
					let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
					line.id = 'creating-relation-line'
					let origin = document.querySelector('[data-id="'+this.creatingRelation[0].id+'"]').getBoundingClientRect()
					line.setAttributeNS(null, 'x1', origin.left - 4 + origin.width);
					line.setAttributeNS(null, 'y1', origin.top + origin.height/2);
					line.setAttributeNS(null, 'x2', event.x);
					line.setAttributeNS(null, 'y2', event.y);
					line.setAttributeNS(null, 'stroke', 'black');
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

app.mount('#app');