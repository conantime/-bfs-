const fs = require('fs');
const readline = require('readline');
const path = require('path');

var filterMain = function (Fiftxt){
let fReadName = path.join(__dirname, "word.txt");
console.log(typeof fReadName);
let input = fs.createReadStream(fReadName);
const rl = readline.createInterface({
    input: input
});
let words = []
rl.on('line', (line) => {
    console.log(`Line from file: ${line}`);
    words.push(line)
});
rl.on('close', (line) => {
    console.log("读取完毕！");
    // console.log(words)
    // var word = "["+words+"]"
    fs.writeFile('output1.js', words, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('ok.');
        }
    });
    const res = makeSensitiveMap(words);
    const results = filterSensitiveWord(Fiftxt, res);
    console.log(results)
})
}
function makeSensitiveMap(sensitiveWordList) {
    // 构造根节点
    const result = new Map();
    for (const word of sensitiveWordList) {
        let map = result;
        for (let i = 0; i < word.length; i++) {
            // 依次获取字
            const char = word.charAt(i);
            // 判断是否存在
            if (map.get(char)) {
                // 获取下一层节点
                map = map.get(char);
            } else {
                // 将当前节点设置为非结尾节点
                if (map.get('laster') === true) {
                    map.set('laster', false);
                }
                const item = new Map();
                // 新增节点默认为结尾节点
                item.set('laster', true);
                map.set(char, item);
                map = map.get(char);
            }
        }

    }
    return result;
}
function checkSensitiveWord(sensitiveMap, txt, index) {
    let currentMap = sensitiveMap;
    let flag = false;
    let wordNum = 0;//记录过滤
    let senList = []
    let sensitiveWord = ''; //记录过滤出来的敏感词
    for (let i = index; i < txt.length; i++) {
        const word = txt.charAt(i);
        console.log(word);
        // console.log(currentMap)
        currentMap = currentMap.get(word);
        console.log(currentMap);
        if (currentMap) {
            wordNum++;
            sensitiveWord += word;
            if (currentMap.get('laster') === true) {
                // 表示已到词的结尾
                flag = true;
                currentMap = sensitiveMap;
                senList.push(sensitiveWord);
                sensitiveWord = '';
                // break
            }
        } else {
            // currentMap = sensitiveMap;
            console.log(wordNum);
            flag = false
            currentMap = sensitiveMap;
            sensitiveWord = '';
            // continue
        }
    }
    // 两字成词
    if (wordNum < 2) {
        flag = false;
    }
    console.log(senList)
    return { flag, senList, sensitiveWord };
}

function filterSensitiveWord(txt, sensitiveMap) {
    let matchResult = { flag: false,senList:[],sensitiveWord: '' };
    // 过滤掉除了中文、英文、数字之外的
    const txtTrim = txt.replace(/[^\u4e00-\u9fa5\u0030-\u0039\u0061-\u007a\u0041-\u005a]+/g, '');
    let newTxt = "";
    for (let i = 0; i < txtTrim.length; i++) {
        matchResult = checkSensitiveWord(sensitiveMap, txtTrim, i);
        if (matchResult.flag) {
            newTxt= txtTrim.replace(matchResult.sensitiveWord,'***');
            console.log(`sensitiveWord:${matchResult.senList[0]}`);
            console.log(`sensitiveWord:${matchResult.sensitiveWord}`);

            break;
        }
    }
    return newTxt;
}

module.exports = {
    filterMain: filterMain
}
