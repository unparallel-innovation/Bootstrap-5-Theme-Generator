import fs from "node:fs";
import * as sass from 'sass'
import hash from 'object-hash'

export type BoostrapThemeSCSS = string | {
	before?: string,
	after?: string
}

const boostrapComponents = [
	"containers",
	"grid",
	"tables",
	"forms",
	"buttons",
	"transitions",
	"dropdown",
	"button-group",
	"nav",
	"navbar",
	"card",
	"accordion",
	"breadcrumb",
	"pagination",
	"badge",
	"alert",
	"progress",
	"list-group",
	"close",
	"toasts",
	"modal",
	"tooltip",
	"popover",
	"carousel",
	"spinners",
	"offcanvas",
	"placeholders"

] as const

export type BootstrapComponent = typeof boostrapComponents[number]

export interface ThemeBackground {
	type: "single" | "gradient",
	color?: string,
	firstColor?: string,
	secondColor?: string,
	orientation?: string | number
}


export interface BootstrapTheme {
	variables?: BootstrapVariables,
	scss?: BoostrapThemeSCSS,
	colors?: BootstrapVariables,
	components?: BootstrapComponent[],
	background?: ThemeBackground,
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
	ignoreMinify?: boolean,
	bootstrapSCSSPath?: string
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
	#bootstrapSCSSPath: string | undefined


	constructor(props?: Bootstrap5GeneratorConstructor) {
		this.#cache = props?.cache
		this.#ignoreMinify = !!props?.ignoreMinify
		this.#bootstrapSCSSPath = props?.bootstrapSCSSPath
	}

	#getBootstrapComponentHM(theme: BootstrapTheme): { [k in BootstrapComponent]?: boolean } | undefined {
		if (!theme.components) return
		const hm: { [k in BootstrapComponent]?: boolean } = {}
		for (const key of theme.components) {
			hm[key] = true
		}
		return hm

	}



	generateCSS(theme: BootstrapTheme): string {
		const bootstrapComponentHM = this.#getBootstrapComponentHM(theme)
		function shouldImport(name: BootstrapComponent): boolean {
			if (!bootstrapComponentHM) return true
			if (!name) return false
			return !!bootstrapComponentHM[name]
		}


		function importBootstrapComponent(name: BootstrapComponent): string {
			if (!shouldImport(name)) return ""
			return `@import "${name}";`
		}

		function importBootstrapComponents(): string {
			return boostrapComponents.map(importBootstrapComponent).filter(el => el).join("\n")
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



		function getThemeColors(): string {
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

		function getVariableFromThemeColors(): string {
			if (!theme?.colors) return ""
			return Object.keys(theme.colors).reduce((a: string, key: string) => (
				`${a}
				 $${key}:${theme!.colors![key]};`
			), "")
		}


		function getGradientFromTheme(): string {

			if (theme.background?.type !== "gradient") return ""
			if (!theme.background?.firstColor || !theme.background?.secondColor) return ""
			const { type, secondColor, firstColor, orientation } = theme.background

			let _orientation: string = "0deg"
			if (typeof orientation === "number") _orientation = `${orientation}deg`
			else if (typeof orientation === "string") _orientation = orientation

			return `
					body {
						background-image: linear-gradient(${_orientation}, ${firstColor}, ${secondColor});
						background-attachment: fixed;
					}
				`
		}

		function getSCSSVariables(): string {
			let bodyBG: string | undefined = variables["$body-bg"]
			let _variables = variables
			if (theme.background?.type === "single" && theme.background.color) bodyBG = theme.background.color
			if (bodyBG) _variables = { ...variables, "$body-bg": bodyBG }
			return Object.keys(_variables).reduce((acc, val) => (
				`${acc}${val}:${_variables[val]};`
			), "")
		}

		const result = sass.compileString(`
				${scssBefore} 
				@import "mixins/banner";
				@include bsBanner("");
				@import "functions";
				${getGradientFromTheme()}
				${getSCSSVariables()}
				${getVariableFromThemeColors()}
				@import "variables";
				@import "variables-dark";


				${getThemeColors()}
				@import "maps";
				@import "mixins";

				@import "root";
				@import "reboot";
				@import "type";
				@import "images";
				
				@import "helpers";

				${importBootstrapComponents()}
				
				@import "utilities";
				@import "utilities/api";
				${scssAfter}
			`, {
			style: this.#ignoreMinify ? "expanded" : "compressed",
			loadPaths: [this.#bootstrapSCSSPath || `${__dirname}/bootstrap/scss`]
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
		const { css, variables, colors, scss, components, background } = theme
		const obj = { variables, css, colors, scss, components, background }
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