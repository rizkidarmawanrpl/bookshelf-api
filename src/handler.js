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
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
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

const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;
    const dataEnum = ['0', '1'];

    let filterBook = books;

    if (name !== undefined) {
        filterBook = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (reading !== undefined && dataEnum.includes(reading)) {
        let read = (reading === '1')? true : false;
        filterBook = books.filter((book) => book.reading === read);
    }

    if (finished !== undefined && dataEnum.includes(finished)) {
        let finish = (finished === '1')? true : false;
        filterBook = books.filter((book) => book.finished === finish);
    }

    return responseSuccess({
        h,
        data: {
            books: filterBook.map((book) => ({
                id       : book.id,
                name     : book.name,
                publisher: book.publisher,
            })),
        },
    })
};

const getBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const book = books.filter((book) => book.id === id)[0];

    if (book !== undefined) {
        return responseSuccess({
            h,
            data: {
                book,
            },
        });
    }

    return responseFail({
        h,
        message: 'Buku tidak ditemukan',
        code   : 404,
    });
}

const editBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    if (name === undefined || name === '') {
        return responseFail({
            h,
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
            code   : 400,
        });
    }

    if (readPage > pageCount) {
        return responseFail({
            h,
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            code   : 400,
        });
    }

    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
        const updatedAt = new Date().toISOString();

        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt,
        };

        return responseSuccess({
            h,
            message: 'Buku berhasil diperbarui',
        });
    }

    return responseFail({
        h,
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
        code   : 404,
    });
}

const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
        books.splice(index, 1);

        return responseSuccess({
            h,
            message: 'Buku berhasil dihapus',
        });
    }

    return responseFail({
        h,
        message: 'Buku gagal dihapus. Id tidak ditemukan',
        code   : 404,
    });
}

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};