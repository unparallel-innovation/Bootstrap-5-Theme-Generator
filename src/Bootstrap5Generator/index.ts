import fs from "node:fs";
import * as sass from 'sass'
import hash from 'object-hash'
export interface BootstrapVariables {
	[key:string]:string
}

export interface Cache {
	getCachedCSS:(id:string)=>(string | undefined | null | Promise<string | undefined | null>),
	setCachedCSS:(id:string,css:string)=>(Promise<void> | void)

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

	async getCSS(variables:BootstrapVariables):Promise<string>{
		const id = hash(variables)
		const cachedCSS = await this.cache?.getCachedCSS(id)
		if(cachedCSS) return cachedCSS
		const generatedCSS =  this.generateCSS(variables)
		this.cache?.setCachedCSS(id,generatedCSS)
		return generatedCSS

	}

}