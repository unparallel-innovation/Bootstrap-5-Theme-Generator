"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bootstrap5Generator_1 = require("./Bootstrap5Generator");
var inst = new Bootstrap5Generator_1.default();
/*
function renderSass(props){
    return new Promise((resolve,reject)=>{
        sass.render(props,(err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}
async function main(){
    const res = await renderSass({
        data:`
            $primary:#ff00ff;
            @import "bootstrap";
        `,
        includePaths:["./bootstrap/scss"]
    })
    fs.writeFileSync('test.css', res.css);

}

*/ 
