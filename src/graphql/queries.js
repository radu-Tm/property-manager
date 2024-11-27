/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProprietate = /* GraphQL */ `
  query GetProprietate($id: ID!) {
    getProprietate(id: $id) {
      id
      nume
      tip
      imagine
      latlong
      adresa
      NumarCladire
      nivel
      dormitoare
      bai
      suprafata
      nota
      documenteProprietate {
        id
        nume
        fisier
        DataColectarii
        data_expirare
        nota
        id_proprietate
        __typename
      }
      inspectii {
        id
        data
        nume_item
        suma
        nota
        id_proprietate
        __typename
      }
      chiriiColectate {
        data
        suma
        nota
        id_proprietate
        __typename
      }
      contracte {
        id
        IDProprietate
        IDChirias
        DataInceput
        Durata
        DataSfarsit
        CrestereProcent
        ChirieInitiala
        Nota
        __typename
      }
      __typename
    }
  }
`;
export const listProprietati = /* GraphQL */ `
  query ListProprietati(
    $filter: ModelProprietateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProprietati(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        nume
        tip
        imagine
        latlong
        adresa
        NumarCladire
        nivel
        dormitoare
        bai
        suprafata
        nota
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getChirias = /* GraphQL */ `
  query GetChirias($id: ID!) {
    getChirias(id: $id) {
      id
      nume
      imagine
      telefon
      telefon2
      nota
      ChiriasAsociat
      contracte {
        id
        IDProprietate
        IDChirias
        DataInceput
        Durata
        DataSfarsit
        CrestereProcent
        ChirieInitiala
        Nota
        __typename
      }
      __typename
    }
  }
`;
export const listChiriasi = /* GraphQL */ `
  query ListChiriasi($limit: Int, $nextToken: String) {
    listChiriasi(limit: $limit, nextToken: $nextToken) {
      id
      nume
      imagine
      telefon
      telefon2
      nota
      ChiriasAsociat
      contracte {
        id
        IDProprietate
        IDChirias
        DataInceput
        Durata
        DataSfarsit
        CrestereProcent
        ChirieInitiala
        Nota
        __typename
      }
      __typename
    }
  }
`;
export const getContract = /* GraphQL */ `
  query GetContract($id: ID!) {
    getContract(id: $id) {
      id
      IDProprietate
      IDChirias
      DataInceput
      Durata
      DataSfarsit
      CrestereProcent
      ChirieInitiala
      Nota
      chirias {
        id
        nume
        imagine
        telefon
        telefon2
        nota
        ChiriasAsociat
        __typename
      }
      proprietate {
        id
        nume
        tip
        imagine
        latlong
        adresa
        NumarCladire
        nivel
        dormitoare
        bai
        suprafata
        nota
        __typename
      }
      __typename
    }
  }
`;
export const listContracte = /* GraphQL */ `
  query ListContracte($limit: Int, $nextToken: String) {
    listContracte(limit: $limit, nextToken: $nextToken) {
      id
      IDProprietate
      IDChirias
      DataInceput
      Durata
      DataSfarsit
      CrestereProcent
      ChirieInitiala
      Nota
      chirias {
        id
        nume
        imagine
        telefon
        telefon2
        nota
        ChiriasAsociat
        __typename
      }
      proprietate {
        id
        nume
        tip
        imagine
        latlong
        adresa
        NumarCladire
        nivel
        dormitoare
        bai
        suprafata
        nota
        __typename
      }
      __typename
    }
  }
`;
export const getDocumenteProprietate = /* GraphQL */ `
  query GetDocumenteProprietate($id: ID!) {
    getDocumenteProprietate(id: $id) {
      id
      nume
      fisier
      DataColectarii
      data_expirare
      nota
      id_proprietate
      __typename
    }
  }
`;
export const listDocumenteProprietate = /* GraphQL */ `
  query ListDocumenteProprietate($limit: Int, $nextToken: String) {
    listDocumenteProprietate(limit: $limit, nextToken: $nextToken) {
      id
      nume
      fisier
      DataColectarii
      data_expirare
      nota
      id_proprietate
      __typename
    }
  }
`;
export const getInspectieProprietate = /* GraphQL */ `
  query GetInspectieProprietate($id: ID!) {
    getInspectieProprietate(id: $id) {
      id
      data
      nume_item
      suma
      nota
      id_proprietate
      __typename
    }
  }
`;
export const listInspectiiProprietate = /* GraphQL */ `
  query ListInspectiiProprietate($limit: Int, $nextToken: String) {
    listInspectiiProprietate(limit: $limit, nextToken: $nextToken) {
      id
      data
      nume_item
      suma
      nota
      id_proprietate
      __typename
    }
  }
`;
export const getChirieColectata = /* GraphQL */ `
  query GetChirieColectata($id: ID!) {
    getChirieColectata(id: $id) {
      data
      suma
      nota
      id_proprietate
      __typename
    }
  }
`;
export const listChirieColectata = /* GraphQL */ `
  query ListChirieColectata($limit: Int, $nextToken: String) {
    listChirieColectata(limit: $limit, nextToken: $nextToken) {
      data
      suma
      nota
      id_proprietate
      __typename
    }
  }
`;
export const getCheltuieli = /* GraphQL */ `
  query GetCheltuieli($id: ID!) {
    getCheltuieli(id: $id) {
      id
      data
      suma
      nota
      id_proprietate
      categorie
      __typename
    }
  }
`;
export const listCheltuieli = /* GraphQL */ `
  query ListCheltuieli($limit: Int, $nextToken: String) {
    listCheltuieli(limit: $limit, nextToken: $nextToken) {
      id
      data
      suma
      nota
      id_proprietate
      categorie
      __typename
    }
  }
`;
