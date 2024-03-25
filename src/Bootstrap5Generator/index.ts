import fs from "node:fs";
import * as sass from 'sass'
import hash from 'object-hash'

export type BoostrapThemeSCSS = string | {
	before?: string,
	after?: string
}

export interface BootstrapTheme {
	variables?: BootstrapVariables,
	scss?: BoostrapThemeSCSS,
	[key: string]: any
}

export interface BootstrapVariables {
	[key: string]: string
}

export interface Cache {
	getCachedCSS: (id: string, theme: BootstrapTheme) => (string | undefined | null | Promise<string | undefined | null>),
	setCachedCSS: (id: string, css: string, theme: BootstrapTheme) => (Promise<void> | void)

}


export interface Bootstrap5GeneratorConstructor {
	cache?: Cache,
	ignoreMinify?: boolean
}
export default class Bootstrap5Generator {

	#cache: Cache | undefined
	#ignoreMinify: boolean;

	constructor(props?: Bootstrap5GeneratorConstructor) {
		this.#cache = props?.cache
		this.#ignoreMinify = !!props?.ignoreMinify

	}


	generateCSS(theme: BootstrapTheme): string {
		const variables = theme.variables || {}
		let scssBefore: string = ""
		let scssAfter: string = ""
		if (typeof theme.scss === "string") {
			scssAfter = theme.scss
		} else {
			scssBefore = theme.scss?.before || ""
			scssAfter = theme.scss?.after || ""
		}
		const variableSCSS = Object.keys(variables).reduce((acc, val) => (
			`${acc}${val}:${variables[val]};`
		), "")
		const result = sass.compileString(`
				${variableSCSS}
				${scssBefore} 
				@import "bootstrap";
				${scssAfter}
			`, {
			style: this.#ignoreMinify ? "expanded" : "compressed",
			loadPaths: [`${__dirname}/bootstrap/scss`]
		})

		return result.css

	}

	async cacheCSS(theme: BootstrapTheme): Promise<string> {
		if (!theme) return ""
		const generatedCSS = this.generateCSS(theme)
		const id = this.#getHashFromTheme(theme)
		await this.#cache?.setCachedCSS(id, generatedCSS, theme)
		return generatedCSS
	}

	#getHashFromTheme(theme: BootstrapTheme): string {
		const { css, variables } = theme
		const obj = { variables, css }
		return hash(obj)
	}


	async getCSS(theme: BootstrapTheme): Promise<string> {
		const id = this.#getHashFromTheme(theme)
		const cachedCSS = await this.#cache?.getCachedCSS(id, theme)
		if (cachedCSS) return cachedCSS
		const generatedCSS = this.generateCSS(theme)
		this.#cache?.setCachedCSS(id, generatedCSS, theme)
		return generatedCSS

	}

}