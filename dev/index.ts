import fs from "node:fs";
import { BootstrapTheme } from "../src";

const Bootstrap5Generator = require("../").Bootstrap5Generator



const storage: any = {}

const cache = {
	setCachedCSS: (id: string, css: string) => {
		storage[id] = css
	},
	getCachedCSS: (id: string) => (storage[id])
}

const variables = {

	"$body-bg": "#ffff00",
	"$info": "#99b6c3",
	"$badge-pill-border-radius": "20rem",
	"$border-radius": "1.5rem",
	"$border-radius-lg": "1.5rem",
	"$border-radius-sm": "1.5rem",
	"$toast-border-radius": "2rem",
	"$color-1": "#6b717f",
	"$color-2": "lighten($color-1,20% )"
}

const theme: BootstrapTheme = {
	/*scss: {
		before: `
		
		body {
			background-image: linear-gradient(45deg, red, blue);
			background-attachment: fixed;
		}
	
		
		`
	},*/
	variables: {


		"info": "#ccffcc",
		"$badge-pill-border-radius": "20rem",
		"$border-radius": "1.5rem",
		"$border-radius-lg": "1.5rem",
		"$border-radius-sm": "1.5rem",
		"$toast-border-radius": "2rem"
	},

	colors: {
		primary: "#FFAACC",
		secondary: "#ccdbe1",
		warning: "#ee8140",
		danger: "#CC3105",
		success: "#B6E186",
		highlight: "#FF00FF"
	}
}

const instance = new Bootstrap5Generator({ cache, ignoreMinify: true })

async function main() {
	try {
		console.log("Generating")
		console.time()
		const css = await instance.getCSS(theme)
		fs.writeFileSync(__dirname + '/test.css', css)
		console.timeEnd()
		console.log("Generating")
		console.time()
		const css2 = await instance.getCSS(theme)
		fs.writeFileSync(__dirname + '/test2.css', css2)
		console.timeEnd()
	}
	catch (e) {
		console.error(e)
	}

}

main()