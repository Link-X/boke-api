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
    addree: string,
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
    id: number
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

export interface ArticleModel {
    addArticle: (params: AddArticle) => any,
    delArticle: (params: DelArticle) => any,
    loveArticle: (params: Id, userData: TokenData) => any,
    getArticleList: (params: Page) => any,
    getMajor: () => any,
    getArticle: (params: Id, userData: TokenData) => any,
    enditArticle: (params: EditArticle) => any,
    seachArticle: (params: SearchArticle) => any,
    tabTags: (params: TabArticle) => any,
    getTags: () => any,
    addArticleComment: (params: AddArticleComment) => any
}

export interface UserModel {
    addUser: (params: AddUserData) => any,
    userLogin: (params: AddUserData) => any,
    enditUser: (params: EnditUser) => any,
    getPhotoData: () => any,
    getUserDetials: (params: TokenData) => any
}
export interface EnditUser {
    id: number,
    name: string,
    userType: string,
    remark: string,
    iphone: string,
    addres: string,
    friendId: string,
    label: string,
    groupId: string,
    loverArticleId: string,
    userArticleId: string,
}

export interface RedisArticle {
    id: number,
    userId: number
}
export interface RedisModel {
    readArticle: (params: RedisArticle) => any,
    getArticleReadLength: (params: RedisArticle) => any,
    loveArticle: (params: RedisArticle) => any,
    getArticleAllData: (id: number) => any,
    getUserIsLoveArticle: (params: RedisArticle) => any,
    getArticleReadDataLen: (params: RedisArticle) => any,
    flushdb: () => void
}


export interface  Utils {
    verifyToken: (token: string) => TokenData,
    joinArray: (key: string[], data: any) => any,
    toLiteral: (str: string) => string,
    getIPAdress: () => string,
    getIp: () => string
}
