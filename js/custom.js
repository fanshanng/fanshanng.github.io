/* 网站运行时间 */
function runtime() {
    window.setTimeout("runtime()", 1000);
    /* 请修改这里的起始时间 */
    let startTime = new Date('01/01/2024 00:00:00');
    let endTime = new Date();
    let timeDiff = endTime.getTime() - startTime.getTime();
    let days = Math.floor(timeDiff / (24 * 3600 * 1000));
    let leave1 = timeDiff % (24 * 3600 * 1000);
    let hours = Math.floor(leave1 / (3600 * 1000));
    let leave2 = leave1 % (3600 * 1000);
    let minutes = Math.floor(leave2 / (60 * 1000));
    let leave3 = leave2 % (60 * 1000);
    let seconds = Math.round(leave3 / 1000);
    
    let timeDisplay = document.getElementById("run-time");
    if(timeDisplay) {
        timeDisplay.innerHTML = `本站已安全运行 ${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
    }
}
runtime();

/* 网页标题动态变化 */
let originTitle = document.title;
let titleTime;
const hiddenTitles = ["(つェ⊂) 我藏好了哦~", "看不见我...", "( .•́ _ʖ •̀.) 等你回来", "404 Not Found"];
const visibleTitles = ["(*´∇｀*) 被你发现啦~", "(OwO) 抓到你了", "欢迎回来！", "(HzH) 嘻嘻"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = getRandomItem(hiddenTitles);
        clearTimeout(titleTime);
    } else {
        document.title = getRandomItem(visibleTitles);
        titleTime = setTimeout(function() {
            document.title = originTitle;
        }, 2000);
    }
});

/* 鼠标点击爱心特效 */
(function(window, document, undefined) {
    var hearts = [];
    window.requestAnimationFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 1000 / 60);
            };
    })();
    init();

    function init() {
        css(".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: fixed;}.heart:after{top: -5px;}.heart:before{left: -5px;}");
        attachEvent();
        gameloop();
    }

    function gameloop() {
        for (var i = 0; i < hearts.length; i++) {
            if (hearts[i].alpha <= 0) {
                document.body.removeChild(hearts[i].el);
                hearts.splice(i, 1);
                continue;
            }
            hearts[i].y--;
            hearts[i].scale += 0.004;
            hearts[i].alpha -= 0.013;
            hearts[i].el.style.cssText = "left:" + hearts[i].x + "px;top:" + hearts[i].y + "px;opacity:" + hearts[i].alpha + ";transform:scale(" + hearts[i].scale + "," + hearts[i].scale + ") rotate(45deg);background:" + hearts[i].color;
        }
        requestAnimationFrame(gameloop);
    }

    function attachEvent() {
        var old = typeof window.onclick === "function" && window.onclick;
        window.onclick = function(event) {
            old && old();
            createHeart(event);
        }
    }

    function createHeart(event) {
        var d = document.createElement("div");
        d.className = "heart";
        hearts.push({
            el: d,
            x: event.clientX - 5,
            y: event.clientY - 5,
            scale: 1,
            alpha: 1,
            color: randomColor()
        });
        document.body.appendChild(d);
    }

    function css(css) {
        var style = document.createElement("style");
        style.type = "text/css";
        try {
            style.appendChild(document.createTextNode(css));
        } catch (ex) {
            style.styleSheet.cssText = css;
        }
        document.getElementsByTagName("head")[0].appendChild(style);
    }

    function randomColor() {
        return "rgb(" + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + ")";
    }
})(window, document);

/* 复制成功提示 */
document.addEventListener('copy', function() {
    // 创建一个简单的提示框
    const toast = document.createElement('div');
    toast.innerText = '复制成功！转载请注明出处哦~';
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    toast.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(toast);
    
    // 2秒后消失
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 2000);
});

/* 侧边栏打字机特效 */
function typeWriter(element, text, i = 0) {
    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(() => typeWriter(element, text, i), 100); // 打字速度
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const subtitle = document.getElementById('typewriter-text');
    if (subtitle) {
        const text = subtitle.getAttribute('data-text');
        subtitle.innerHTML = ''; // 清空原始内容
        typeWriter(subtitle, text);
    }
});
