// 1. 页面加载完成后执行（确保DOM元素已生成）
document.addEventListener('DOMContentLoaded', () => {
    // 第一步：获取Waline服务器地址（从页脚的waline-index-count元素读取，确保和配置一致）
    const walineIndexCount = document.querySelector('.waline-index-count');
    const walineUrl = walineIndexCount ? walineIndexCount.getAttribute('waline-url') : '';
    if (!walineUrl) {
        console.error('Waline serverURL未找到，请检查页脚waline-index-count元素的waline-url属性');
        return;
    }

    // 第二步：定义「获取浏览量」函数（支持单篇/批量获取）
    function getViewCount(paths) {
    const url = `${walineUrl}/api/article?` + paths.map(p => `path=${encodeURIComponent(p)}`).join('&');
    return fetch(url)
        .then(res => res.json())
        .then(response => {
        // 关键：Waline接口返回的是{errno, errmsg, data}，需提取data数组
        if (response.errno === 0) {
            return response.data; // 返回真正的浏览量数组
        } else {
            console.error('Waline接口返回错误：', response.errmsg);
            return []; // 错误时返回空数组
        }
        })
        .catch(err => {
        console.error('获取浏览量失败：', err);
        return [];
        });
    }
    // 在 waline-stats.js 中，添加以下函数（放在 getViewCount 之后）
    function getCommentCount(paths) {
    const url = `${walineUrl}/api/count?` + paths.map(p => `path=${encodeURIComponent(p)}`).join('&');
    return fetch(url)
        .then(res => res.json())
        .then(response => {
        // 解析 Waline 评论数接口的返回格式：{errno, errmsg, data}
        if (response.errno === 0) {
            return response.data; // 返回评论数数组（每个元素含 path 和 comment）
        } else {
            console.error('Waline评论数接口返回错误：', response.errmsg);
            return []; // 错误时返回空数组，避免崩溃
        }
        })
        .catch(err => {
        console.error('获取评论数失败：', err);
        return [];
        });
    }

    // 第三步：定义「上报浏览量」函数（文章页专用）
    function addViewCount(path) {
        fetch(`${walineUrl}/api/article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: path }) // 上报当前文章路径
        }).catch(err => console.error('上报浏览量失败：', err));
    }

    // 第四步：区分「列表页」和「文章页」，执行对应的统计逻辑
    const currentPath = window.location.pathname;

    // 情况1：列表页（主页、分页页，路径为"/"或"/page/1/"等）
    const isListPage = currentPath === '/' || currentPath.includes('/page/');
    if (isListPage) {
        // 获取所有文章的浏览量元素和路径
        const pageViewEles = document.querySelectorAll('.waline-pageview-count');
        const paths = Array.from(pageViewEles).map(ele => ele.getAttribute('data-path'));
        if (paths.length > 0) {
            getViewCount(paths).then(counts => {
            // 关键：先校验是否为数组，避免非数组导致崩溃
            if (Array.isArray(counts)) {
                counts.forEach((item, index) => {
                    pageViewEles[index].innerText = item?.time || 0;
                });
            } else {
                console.error('Waline返回的浏览量数据不是数组！当前类型：', typeof counts, '数据内容：', counts);
                // 可选：若数据异常，给所有元素设为0
                pageViewEles.forEach(ele => ele.innerText = '0');
            }
        });
        }
    }

    // 情况2：文章页（路径包含"/p/"，你的文章URL格式为"/p/xxx/"）
    const isPostPage = currentPath.includes('/p/');
    if (isPostPage) {
        // 获取当前文章的浏览量元素和路径
        const pageViewEle = document.querySelector('.waline-pageview-count');
        if (pageViewEle) {
            const path = pageViewEle.getAttribute('data-path');
            // 先上报浏览量，再获取最新值并更新
            addViewCount(path);
            getViewCount([path]).then(counts => {
                pageViewEle.innerText = counts[0]?.time || 0;
            });
        }
    }

    // 情况3：修复文章页页脚「总访问量」的data-path错误（见问题三）
    const indexCountEle = document.querySelector('.waline-index-count');
    if (isPostPage && indexCountEle?.getAttribute('data-path') === '/404.html') {
        // 将总访问量的data-path修正为当前文章路径
        indexCountEle.setAttribute('data-path', currentPath);
        // 获取并更新总访问量（若需要）
        fetch(`${walineUrl}/api/visits?path=${encodeURIComponent(currentPath)}`)
            .then(res => res.json())
            .then(data => {
                indexCountEle.innerText = data?.total || 0;
            });
    }

      const commentEles = document.querySelectorAll('.waline-comment-count');
  const commentPaths = Array.from(commentEles).map(ele => ele.getAttribute('data-path'));
  
  if (commentPaths.length > 0) {
    getCommentCount(commentPaths).then(counts => {
      if (Array.isArray(counts)) {
        counts.forEach((item, index) => {
          // 将评论数更新到页面元素
          commentEles[index].innerText = item?.comment || 0;
        });
      } else {
        console.error('评论数数据格式异常（非数组）：', counts);
        commentEles.forEach(ele => ele.innerText = '0');
      }
    });
  }
});