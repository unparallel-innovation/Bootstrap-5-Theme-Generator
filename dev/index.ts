import fs from "node:fs";
import { BootstrapTheme } from "../src";
import { Bootstrap5Generator } from "../dist";





const storage: any = {}

const cache = {
	setCachedCSS: (id: string, css: string) => {
		storage[id] = css
	},
	getCachedCSS: (id: string) => (storage[id])
}

const theme: BootstrapTheme = {
	colors: {
		primary: "#ff0000",
		secondary: "#00ffff"
	}
}

const theme2: BootstrapTheme = {
	colors: {
		primary: "#00ff00",
		secondary: "#00ffff"
	}
}


const instance = new Bootstrap5Generator({ cache, ignoreMinify: true })
const instance2 = new Bootstrap5Generator({ cache, ignoreMinify: true, useObjectToComputeHash: true })

async function main() {
	try {

		console.time("instance1 - 1")
		const css = await instance.getCSS(theme)
		console.timeEnd("instance1 - 1")

		console.time("instance2 - 1")
		const css2 = await instance2.getCSS(theme2)
		console.timeEnd("instance2 - 1")

		console.time("instance1 - 2")
		const css3 = await instance.getCSS(theme)
		console.timeEnd("instance1 - 2")

		console.time("instance2 - 2")
		const css4 = await instance2.getCSS(theme2)
		console.timeEnd("instance2 - 2")

		fs.writeFileSync(__dirname + '/test.css', css)


	}
	catch (e) {
		console.error(e)
	}

}

main()