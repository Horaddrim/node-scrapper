const cheerio = require('cheerio');
const rp = require('request-promise');

const URL = "https://www.portaldatransparencia.gov.br/servidores/Funcao-ListaServidores.asp?CodFuncao=CSU&CodNivel=0001";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
supervisor = [];
pessoas = [];
dados = {};
Exports = [];

const options = {
    uri: URL,
    transform: (body) => 
    {
        return cheerio.load(body);
    }
};


rp(options)
    .then(($) => 
    {
        $('tbody').each((i, elem) => 
        {
            //console.log($(elem).html().toString());
            let html = cheerio.load($(elem).html().toString());
            html(elem).each((i, elem) => 
            {
                html(elem).children()
                    .parent()
                        .children()
                            .parent()
                                .children()
                                    .each((i, elem) => 
                                    {
                                        html(elem).each((i, elem) => 
                                        {
                                            html(elem).children().each((i,elem) => 
                                            {
                                                elemento = html(elem).children().text();
                                                primeira = elemento.charAt(1);
                                                
                                                if(elemento != "" && primeira.toUpperCase() === primeira && /^[a-zA-Z ]+$/.test(elemento))
                                                {
                                                    pessoas.push(elemento.trim());
                                                }

                                                supervisor.push(html(elem).children('a').attr('href') != undefined 
                                                                ? html(elem).children('a').attr('href')
                                                                : "");
                                            })
                                            .html();
                                        })
                                        .html();
                                    })
                        .html();
                //console.log(supervisor);
                
                let arrayLimpo = [];
                supervisor.forEach((element) =>
                {
                    if(element.startsWith("Funcao"))
                    {
                        arrayLimpo.push(element);
                    }
                }, this);

                dados = 
                {
                    NomeServidores: pessoas,
                    IdServidores: arrayLimpo
                };
                //console.log(dados);

                if(pessoas.length === arrayLimpo.length)
                {
                    i = pessoas.length
                    while(i > 0)
                    {
                        dados = 
                        {   
                            Nome: pessoas.pop(),
                            IdUrl: arrayLimpo.pop()
                        };
                        Exports.push(dados);
                        i--;
                    }
                    console.log(Exports);
                }
            });
        });
    })
    .catch((err) => 
    {
        console.log(err);
    });
