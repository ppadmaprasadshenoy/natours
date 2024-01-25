class APIFeatures{
    constructor(query,queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        const queryObject = {...this.queryString};
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach(el => delete queryObject[el]);

        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr)); 
        return this;
    }

    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');     //Mongo takes strings seperated by spaces
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-createdAt _id');
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' '); //Mongo takes strings seperated by spaces
            this.query = this.query.select(fields);
        }
        else{
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1)* limit;

        // Page 1 - 1 to 10, Page 2 - 11 to 20, Page 3 - 21 to 30,.. 
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;