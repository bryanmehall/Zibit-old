import { checkASTs, compileToJS } from './utils'
import { jsCompilers } from './jsCompiler'

//build string of function from ast node and add that function to the function table
export const buildFunction = (ast) => {
                console.log(ast)
    checkAST(ast)
    const string = jsCompilers[ast.type](ast)
    if (ast.inline && !ast.isFunction){
        return { string , newFunctionTable: {} }
    } else {
        const argsList = Object.keys(ast.args).concat('functionTable')
        try {
            const func = string.hasOwnProperty('varDefs') ?
                compileToJS(argsList, `${string.varDefs} return ${string.returnStatement}`) :
                compileToJS(argsList, '\t return '+string)
            const newFunctionTable = { [ast.hash]: func }
            if (ast.isFunction){
                return {
                    string: `functionTable.${ast.hash}`,
                    newFunctionTable
                }
            }
            return {
                string: `\tfunctionTable.${ast.hash}(${argsList.join(",")})`,
                newFunctionTable
            }
        } catch (e) {
            console.log('compiled function syntax error', ast, string)
            throw new Error('Lynx Compiler Error: function has invalid syntax')
        }
    }
}

export const astToFunctionTable = (ast) => {
    const children = ast.children
    const childASTs = Object.values(children)
    checkASTs(childASTs, ast)
    const childTables = childASTs.map(astToFunctionTable)

    const varDefs = ast.variableDefs || []
    const varDefASTs = varDefs.map((varDef) => (varDef.ast))
    checkASTs(varDefASTs, ast)
    const varDefTables = varDefASTs.map(astToFunctionTable)

    const newFunctionTable = ast.type === 'app' ? {} : buildFunction(ast).newFunctionTable
    const functionTable = Object.assign(newFunctionTable, ...varDefTables, ...childTables)
    return functionTable
}

export const checkAST = (ast) => {
    if (ast === undefined) {
        throw new Error("ast is undefined")
    } else if (!jsCompilers.hasOwnProperty(ast.type)){
        throw new Error(`LynxError: compiler does not have type ${ast.type}`)
    }
}