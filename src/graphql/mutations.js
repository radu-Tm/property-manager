/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProprietate = /* GraphQL */ `
  mutation CreateProprietate($input: CreateProprietateInput!) {
    createProprietate(input: $input) {
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
export const updateProprietate = /* GraphQL */ `
  mutation UpdateProprietate($input: UpdateProprietateInput!) {
    updateProprietate(input: $input) {
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
export const deleteProprietate = /* GraphQL */ `
  mutation DeleteProprietate($id: ID!) {
    deleteProprietate(id: $id) {
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
export const createChirias = /* GraphQL */ `
  mutation CreateChirias($input: CreateChiriasInput!) {
    createChirias(input: $input) {
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
export const updateChirias = /* GraphQL */ `
  mutation UpdateChirias($input: UpdateChiriasInput!) {
    updateChirias(input: $input) {
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
export const deleteChirias = /* GraphQL */ `
  mutation DeleteChirias($id: ID!) {
    deleteChirias(id: $id) {
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
export const createContract = /* GraphQL */ `
  mutation CreateContract($input: CreateContractInput!) {
    createContract(input: $input) {
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
export const updateContract = /* GraphQL */ `
  mutation UpdateContract($input: UpdateContractInput!) {
    updateContract(input: $input) {
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
export const deleteContract = /* GraphQL */ `
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id) {
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
