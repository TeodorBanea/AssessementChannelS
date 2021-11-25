
const Apify = require('apify');
const { handleStart, handleList, handleDetail } = require('./src/routes');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        minConcurrency: 10,
        maxConcurrency: 20,
        maxRequestRetries: 1,
        handlePageTimeoutSecs: 30,
        maxRequestsPerCrawl: 10,
        maxConcurrency: 50,

        handlePageFunction: async ({request , $ }) => {
          log.debug(`Processing ${request.url}...`)

          const title = $('title').text()

          var price;
          var decimal;
          
          if($('p.product-new-price.has-deal').text())
            { 
              price = $('p.product-new-price').clone().children().remove().end().text()
              decimal = $('p.product-new-price').clone().children().text()
            }
          else if ($('p.product-new-price').text())
            { 
              price = $('p.product-new-price').clone().children().remove().end().text()
              decimal = $('p.product-new-price').clone().children().text()
            }

          price = price.split(' ')
          decimal = decimal.split('Lei')
          price = `${price[0]},${decimal[0]} Lei`
      
          var StockStatus;
          //Checking if the product is in stock
          if($('span.label.label-in_stock').text())          
              StockStatus ="InStock"
          else if($('span.label.label-out_of_stock').text())  
              StockStatus = "OutOfStock"
    
         await Apify.pushData({
            title, 
            url: request.url,
            price,
            StockStatus,
        });
        
        dataset = await Apify.openDataset();
        const wholeDataset = await dataset.reduce((memo, value) => {
          memo.push(value);
          return memo;
        }, []);
        await Apify.setValue('output',wholeDataset);
        },
    });

    log.info('STARTING the crawl.If there are any problems you can stop the crawl with "CTRL+C" ');
    await crawler.run();
    log.info('Crawler FINISHED. You can now check the OUTPUT.JSON to see the data.');
});
