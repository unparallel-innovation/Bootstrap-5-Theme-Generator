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
	colors?: BootstrapVariables,
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

const defaultColorKeysHM: { [k: string]: boolean | undefined } = {
	primary: true,
	secondary: true,
	success: true,
	info: true,
	warning: true,
	danger: true,
	light: true,
	dark: true


}

export default class Bootstrap5Generator {

	#cache: Cache | undefined
	#ignoreMinify: boolean;

	constructor(props?: Bootstrap5GeneratorConstructor) {
		this.#cache = props?.cache
		this.#ignoreMinify = !!props?.ignoreMinify

	}

	#getVariableFromThemeColors(theme: BootstrapTheme): string {
		if (!theme?.colors) return ""
		return Object.keys(theme.colors).reduce((a: string, key: string) => (
			`${a}
			 $${key}:${theme!.colors![key]};`
		), "")
	}


	#getThemeColors(theme: BootstrapTheme): string {
		if (!theme?.colors) return ""
		const defaultColorKeys = Object.keys(defaultColorKeysHM)
		const keys = [...defaultColorKeys, ...Object.keys(theme.colors).filter(el => !defaultColorKeysHM[el])]
		const themeColors = keys.reduce((a: string, key: string) => (
			`${a}
			 "${key}":$${key},`
		), "")


		const textColors = keys.reduce((a: string, key: string) => (
			`${a}
			 "${key}":shade-color($${key}, 60%),`
		), "")

		const subtleColors = keys.reduce((a: string, key: string) => (
			`${a}
			 "${key}": tint-color($${key}, 80%),`
		), "")


		const borderSubtleColors = keys.reduce((a: string, key: string) => (
			`${a}
			 "${key}": tint-color($${key}, 60%),`
		), "")

		return `
		$theme-colors: (
			${themeColors}
		  );


		  $theme-colors-text: (
			${textColors}
		  );

		  $theme-colors-bg-subtle: (
			${subtleColors}
		  );

		  $theme-colors-border-subtle: (
			${borderSubtleColors}
		  );
		`
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
				${scssBefore} 
				@import "mixins/banner";
				@include bsBanner("");
				@import "functions";

				${variableSCSS}
				${this.#getVariableFromThemeColors(theme)}
				@import "variables";
				@import "variables-dark";


				${this.#getThemeColors(theme)}
				@import "maps";
				@import "mixins";
				@import "root";

	
				@import "reboot";
				@import "type";
				@import "images";
				@import "containers";
				@import "grid";
				@import "helpers";


				
				@import "tables";
				@import "forms";
				@import "buttons";
				@import "transitions";
				@import "dropdown";
				@import "button-group";
				@import "nav";
				@import "navbar";
				@import "card";
				@import "accordion";
				@import "breadcrumb";
				@import "pagination";
				@import "badge";
				@import "alert";
				@import "progress";
				@import "list-group";
				@import "close";
				@import "toasts";
				@import "modal";
				@import "tooltip";
				@import "popover";
				@import "carousel";
				@import "spinners";
				@import "offcanvas";
				@import "placeholders";
				
				@import "utilities";
				@import "utilities/api";
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
		const { css, variables, colors, scss } = theme
		const obj = { variables, css, colors, scss }
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