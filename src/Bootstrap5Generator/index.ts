import fs from "node:fs";
import * as sass from 'sass'
import hash from 'object-hash'

export type BoostrapThemeSCSS = string | {
	before?: string,
	after?: string
}
export type BootstrapComponent = "images" |
	"containers" |
	"grid" |
	"tables" |
	"forms" |
	"buttons" |
	"transitions" |
	"dropdown" |
	"button-group" |
	"nav" |
	"navbar" |
	"card" |
	"accordion" |
	"breadcrumb" |
	"pagination" |
	"badge" |
	"alert" |
	"progress" |
	"list-group" |
	"close" |
	"toasts" |
	"modal" |
	"tooltip" |
	"popover" |
	"carousel" |
	"spinners" |
	"offcanvas" |
	"placeholders"

export interface BootstrapTheme {
	variables?: BootstrapVariables,
	scss?: BoostrapThemeSCSS,
	colors?: BootstrapVariables,
	components?: BootstrapComponent[],
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

	#getBootstrapComponentHM(theme: BootstrapTheme): { [k in BootstrapComponent]?: boolean } | undefined {
		if (!theme.components) return
		const hm: { [k in BootstrapComponent]?: boolean } = {

		}
		for (const key of theme.components) {
			hm[key] = true
		}
		return hm

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
		const bootstrapComponent = this.#getBootstrapComponentHM(theme)
		function shouldImport(name: BootstrapComponent): boolean {
			if (!bootstrapComponent) return true
			if (!name) return false
			return !!bootstrapComponent[name]
		}


		function importBootstrapComponent(name: BootstrapComponent): string {
			if (!shouldImport(name)) return ""
			return `@import "${name}";`
		}

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
				${importBootstrapComponent("containers")}
				${importBootstrapComponent("grid")}
		
				@import "helpers";

		
				${importBootstrapComponent("tables")}
				${importBootstrapComponent("forms")}
				${importBootstrapComponent("buttons")}
				${importBootstrapComponent("transitions")}
				${importBootstrapComponent("dropdown")}
				${importBootstrapComponent("button-group")}
				${importBootstrapComponent("nav")}
				${importBootstrapComponent("navbar")}
				${importBootstrapComponent("card")}
				${importBootstrapComponent("accordion")}
				${importBootstrapComponent("breadcrumb")}
				${importBootstrapComponent("pagination")}
				${importBootstrapComponent("badge")}
				${importBootstrapComponent("alert")}
				${importBootstrapComponent("progress")}
				${importBootstrapComponent("list-group")}
				${importBootstrapComponent("close")}
				${importBootstrapComponent("toasts")}
				${importBootstrapComponent("modal")}
				${importBootstrapComponent("tooltip")}
				${importBootstrapComponent("popover")}
				${importBootstrapComponent("carousel")}
				${importBootstrapComponent("spinners")}
				${importBootstrapComponent("offcanvas")}
				${importBootstrapComponent("placeholders")}
				
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
		const { css, variables, colors, scss, components } = theme
		const obj = { variables, css, colors, scss, components }
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