const Brightpearl = require('brightpearl');
const csv = require('csv');
const fs = require('fs');
const credentials = require('./brightpearl-credential');

module.exports = {
    startDataPull: startDataPull
};


var bp = Brightpearl(credentials.getDatacenter(), credentials.getAccountId(), credentials.getAppRef(), credentials.getToken());

var currentTime = new Date();
currentTime = "product_report_" + JSON.stringify(currentTime).substring(1, 19).replace(/T/g, "_").replace(/:/g, "-");

var path = __dirname + "\\client-data\\" + currentTime + ".csv";

var headers = "Product ID,SKU,Product Name,Created Date,Brand,Categories,Type ID,Bundle,Stock Tracked,Status,UPC,ISBN,EAN,Barcode,Seasons,Sales popup message,Warehouse popup message,Tax Code,Weight,Height,Width,Length,Primary Supplier Company,All suppliers,Short Description,Long Description,Reorder Level,Reorder Quantity";


function startDataPull() {
    clearOldFiles();
    createCSV(path, headers);
    pullProductUris();
}



function pullProductUris() {
    bp.call('OPTIONS', '/product-service/product', null, function (error, httpStatus, response) {


        if (error) {
            return console.error("write error:  " + error);
        }
        var nextLine = "";
        var productSet;
        for (var eachUri = 0; eachUri < response.getUris.length; eachUri++) {

            productSet = response.getUris[eachUri].substring(9);
            getProduct(productSet);

        }

    });
}

function clearOldFiles() {
    fs.readdir('./server/client-data', (err, files) => {
        files.forEach(file => {
            fs.unlinkSync(__dirname + "\\client-data\\" + file, (err) => {
                if (err) {
                    console.log("failed to delete local image:" + err);
                } else {
                    console.log('successfully deleted local image');
                }
            });
        });
    })


}

function createCSV(path, headers) {
    fs.writeFileSync(path, headers, function (error) {
        if (error) {
            console.error("write error:  " + error.message);
        }
    });
}

function getProduct(product) {
    return bp.call('GET', '/product-service/product/' + product,
        null,
        function (error, httpStatus, response) {
            if (error) {
                return console.error(error);
            }

            for (var i = 0; i < response.length; i++) {
                nextLine = "\n"
                    + tidyString(response[i].id) + ","
                    + tidyString(response[i].identity.sku) + ","
                    + tidyString(response[i].salesChannels[0].productName) + ","
                    + tidyString(response[i].createdOn) + ","
                    + tidyString(response[i].brandId) + ","
                    + tidyString(response[i].salesChannels[0].categories[0].categoryCode) + ","
                    + tidyString(response[i].productTypeId) + ","
                    + tidyString(response[i].composition.bundle) + ","
                    + tidyString(response[i].stock.stockTracked) + ","
                    + tidyString(response[i].status) + ","
                    + "UPC" + ","
                    + tidyString(response[i].identity.isbn) + ","
                    + tidyString(response[i].identity.ean) + ","
                    + tidyString(response[i].identity.barcode) + ","
                    + tidyString(response[i].seasonIds[0]) + "," //insufficient // /product-service/season/{ID-SET}
                    + "Sales popup message" + ","
                    + "Warehouse popup message" + ","
                    + tidyString(response[i].financialDetails.taxCode.code) + ","
                    + tidyString(response[i].stock.weight.magnitude) + ","
                    + tidyString(response[i].stock.dimensions.height) + ","
                    + tidyString(response[i].stock.dimensions.width) + ","
                    + tidyString(response[i].stock.dimensions.length) + ","
                    + "Primary Supplier Company - ambiguous" + ","
                    + "All suppliers - ambiguous" + ","
                    + tidyString(response[i].salesChannels[0].shortDescription.text) + ","
                    + tidyString(response[i].salesChannels[0].description.text) + ","
                    + tidyString(response[i].warehouses[2].reorderLevel) + ","      //only from warehouse with ID 2
                    + tidyString(response[i].warehouses[2].reorderQuantity);        //only from warehouse with ID 2

                appendToCSV(nextLine);
            }
        });
}


function tidyString(stringToParse) {


    stringToParse = JSON.stringify(stringToParse);

    if (stringToParse == "" || stringToParse == "undefined" || stringToParse == undefined) {
        stringToParse = "NULL";
    }

    var parsedString = stringToParse.replace(/,/g, "").replace(/\\/g, "").replace(/"/g, "");
    return parsedString;

}

//put all brand data into an array -> /brand/74,76 first then add to this.
// /product-service/brightpearl-category/
// /product-service/season/{ID-SET}

function getBrandName(brandId) {
    bp.call('GET', '/product-service/brand/' + brandId, null, function (error, httpStatus, response) {

        if (error) {
            return console.error(error);
        }

        return response[0].name;

    });
}

function getCategoryName(categoryId) {
    bp.call('GET', '/product-service/brightpearl-category/' + categoryId, null, function (error, httpStatus, response) {

        if (error) {
            return console.error(error);
        }

        return response[0].name;

    });
}



function appendToCSV() {
    fs.appendFileSync(path, nextLine, function (error) {
        if (error) {
            console.error("write error:  " + error.message);
        }
    });
}






/*
bp.call('GET', '/product-service/product-type/1', null, function (error, httpStatus, response) {

    if (error) {
        return console.error(error);
    }

    console.log(JSON.stringify(response[0]));

});
*/

/*
    bp.call('GET', '/product-service/brightpearl-category/539', null, function(error, httpStatus, response){
    
        if (error) {
            return console.error(error);
        }
        console.log(response[0]);
});

*/


/*
        bp.call('GET', '/product-service/product/1422', null, function(error, httpStatus, response){
        
            if (error) {
                return console.error(error);
            }
            console.log(JSON.stringify(response));

            console.log(tidyString(response[0].identity.barcode));
            console.log(response[0].identity.barcode);

        });
*/


