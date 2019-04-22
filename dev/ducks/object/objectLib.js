import { UNDEFINED } from './constants'
const constructString = (string) => ({
    jsPrimitive: { type: "string", value: string, args: {} }
})
export const objectLib = {
	id: (id) => ({
			jsPrimitive: { type: 'id', id }
	}),
	undef: {
        name: constructString(UNDEFINED)
	},
	union: (set1, set2, scope) => ({
		props: {
			set1: set1,
			set2: set2,
			id: 'union',
			function: 'unionFunction',
			scope,
			jsPrimitive: { type: 'apply' }
		}
	}),
	find: (attrList) => { //switch this to get?
		if (attrList.length === 1){
			return {
				props: {
					jsPrimitive: { type: "find" },
					attribute: attrList[0]
				}
			}
		} else {
			const currentAttr = attrList.shift()
			return {
				type: "find",
				props: {
					jsPrimitive: { type: "find" },
					attribute: currentAttr,
					then: objectLib.find(attrList)
				}
			}
		}
	},
	constructSearch: (query) => ({ //add support for searching different databases
			query,
			id: 'search'+query,
			jsPrimitive: { type: 'search', id: query }
	}),
    constructString,
    constructArray: function(name, elements){
        return {
                name: "array",
                instanceOf: "array",
                jsPrimitive: { type: "array", value: elements }
            }
    },
	constructSet: function(id, elements){
		const length = elements.length
		if (length === 1){
			return elements[0]
		} else {

			const set1 = this.constructSet('sub1'+id, elements.slice(0, length/2))
			const set2 = this.constructSet('sub2'+id, elements.slice(length/2))
			return {
				type: 'set',
				props: {
					jsPrimitive: { type: 'set' },
                    type: objectLib.constructString('set'),
					subset1: set1,
					subset2: set2,
                    name: objectLib.constructString('set'),
					id: id
				}
			}
		}
	}
}
