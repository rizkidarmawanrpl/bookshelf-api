const { nanoid } = require("nanoid");
const books      = require("./books");

const responseSuccess = ({h, message = '', data = {}, code = 200}) => {
    let dataJson = {
        status : 'success',
        message: message,
    };
    if (JSON.stringify(data) !== '{}') dataJson.data = data;

    const response = h.response(dataJson);
    response.code(code);
    return response;
};

const responseFail = ({h, message = '', data = {}, code = 500}) => {
    let dataJson = {
        status : 'fail',
        message: message,
    };
    if (JSON.stringify(data) !== '{}') dataJson.data = data;

    const response = h.response(dataJson);
    response.code(code);
    return response;
};

const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;


    if (name === undefined || name === '') {
        return responseFail({
            h,
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
            code   : 400,
        });
    }

    if (readPage > pageCount) {
        return responseFail({
            h,
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
            code   : 400,
        });
    }

    const id         = nanoid(16);
    const finished   = (pageCount === readPage)? true : false;
    const insertedAt = new Date().toISOString();
    const updatedAt  = insertedAt;

    const newBook = {
        id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
    };

    books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
        return responseSuccess({
            h,
            message: 'Buku berhasil ditambahkan',
            data   : {
                bookId: id,
            },
            code: 201,
        });
    }

    return responseFail({
        h,
        message: 'Buku gagal ditambahkan'
    });
};

module.exports = { addBookHandler };