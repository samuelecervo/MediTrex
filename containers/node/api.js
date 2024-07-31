require('dotenv').config();

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.ARTICLE_API_KEY);

class functions {
  static getArticles(n) {
    const res = new Promise((resolve, reject) => {

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = yesterday.toISOString().split('T')[0];

      newsapi.v2.everything({
        q: 'medical',
        language: 'en',
        sortBy: 'relevancy',
        from: formattedDate,
        page: 1
      }).then(response => {
        if (response.status == 'ok') {
          let modifiedArray = response.articles.map(item => {
            return {
              ...item,
              content: item.content.split("… [")[0] + "…"
            };
          });
          if (n > Object.keys(modifiedArray).length)
            resolve(modifiedArray);
          else
            resolve(modifiedArray.slice(0, n));
        } else
          resolve(new Array());
      }).catch(error => {
        resolve(new Array());
      });
    });
    return res;
  }


}

module.exports = functions;