export interface UserData {
    id: number,
    userName: string,
    password: string,
    create: string,
    [propName: string]: any,
}
export interface TokenData {
    iss: string,
    name: string,
    admin: boolean,
    userName: string,
    password: string,
    data: UserData,
}
export interface Dict {
    '\b': string,
    '\t': string,
    '\n': string,
    '\v': string,
    '\f': string,
    '\r': string
}

export interface ResPonseResetData {
    code: number,
    message: string,
    data: object
}

export interface AddUserData {
    userName: string,
    password: string,
    province?: string,
    city?: string,
    district?: string
}

export interface MysqlData {
    host: string,
    user: string,
    password: string,
    database: string,
    useConnectionPooling: boolean
}

export interface AddArticle {
    html: string,
    markdown: string,
    introduce: string,
    userName: string,
    userId: number,
    userImage: string,
    title: string,
    tagId: string,
    articleImg: string,
    createDate?: string
}

export interface Page {
    page: number,
    pageSize: number,
}

export interface DelArticle {
    userName: string,
    userId: number,
    id: number
}

export interface Id {
    id: string | number
}

export interface EditArticle {
    markdown: string,
    title: string,
    tagId: string,
    articleImg: string,
    id: string | number
}

export interface SearchArticle {
    query: string
}

export interface TabArticle {
    tagId: number
}

export interface AddArticleComment {
    createDate?: string,
    text: string,
    userName: string,
    userImage: string,
    articleId: string,
    userId: number
}

export interface ArticleDetails {
    id: number | string,
    title: string,
    markdown: string,
    tag: string,
    createDate: string,
    readNumber: number,
    markdown_index: string,
    title_index: string,
    tagId: number,
    major: number,
    major2: number,
    articleImg: string,
    userName: string,
    userImage: string,
    introduce: string,
    userId: number,
    isEdit?: boolean
}