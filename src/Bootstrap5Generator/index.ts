import fs from "node:fs";
import * as sass from 'sass'
import hash from 'object-hash'


export interface BootstrapTheme {
	variables:BootstrapVariables,
	[key:string]:any
}

export interface BootstrapVariables {
	[key:string]:string
}

export interface Cache {
	getCachedCSS:(id:string,theme:BootstrapTheme)=>(string | undefined | null | Promise<string | undefined | null>),
	setCachedCSS:(id:string,css:string,theme:BootstrapTheme)=>(Promise<void> | void)

}

export interface Bootstrap5GeneratorConstructor {
	cache?:Cache
}
export default class Bootstrap5Generator {

	private cache: Cache | undefined

	constructor(props?:Bootstrap5GeneratorConstructor) {
		this.cache = props?.cache

	}


	generateCSS(variables:BootstrapVariables = {}):string{
		const css = Object.keys(variables).reduce((acc,val)=>(
			`${acc}${val}:${variables[val]};`
		),"")
		const result = sass.compileString(`
				${css}
				@import "bootstrap";
			`,{
			loadPaths:[`${__dirname}/bootstrap/scss`]
		})
		return result.css

	}

	async cacheCSS(theme:BootstrapTheme):Promise<string>{
		if(!theme?.variables) return ""
		const variables = theme.variables
		const generatedCSS =  this.generateCSS(variables)
		const id = hash(variables)
		await this.cache?.setCachedCSS(id,generatedCSS,theme)
		return generatedCSS
	}

	async getCSS(theme:BootstrapTheme):Promise<string>{
		const variables = theme.variables
		const id = hash(variables)
		const cachedCSS = await this.cache?.getCachedCSS(id,theme)
		if(cachedCSS) return cachedCSS
		const generatedCSS =  this.generateCSS(variables)
		this.cache?.setCachedCSS(id,generatedCSS,theme)
		return generatedCSS

	}

}