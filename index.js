const cheerio = require('cheerio');
const rp = require('request-promise');

const URL = "https://www.portaldatransparencia.gov.br/servidores/Funcao-ListaServidores.asp?CodFuncao=CSU&CodNivel=0001";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//Dados a serem coletados, desculpem pela semantica, porém foi me dando ideias assim :D!
supervisor = [];
pessoas = [];
cpf = [];
dados = {};
Exports = [];

valores = [];
valoresCPF = [];

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
                                            cpfs = cheerio.load(html(elem).html());
                                            cpf.push(cpfs('body').html().substring(0,14));

                                            html(elem).children().each((i,elem) => 
                                            {
                                                elemento = html(elem).children().text();
                                                primeira = elemento.charAt(1);

                                                //'td[class=firstChild]'
                                                
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
                        arrayLimpo.push("https://www.portaldatransparencia.gov.br/servidores/Servidor-DetalhaRemuneracao" + element.substring(22) + "&bInformacaoFinanceira=True");
                    }
                }, this);

                dados = 
                {
                    NomeServidores: pessoas,
                    IdServidores: arrayLimpo,
                    cpfServidores: cpf
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
                            IdUrl: arrayLimpo.pop(),
                            CPF: cpf.pop()
                        };
                        Exports.push(dados);
                        i--;
                    }
                    //console.log(Exports);
                    Exports.forEach((element) => 
                    {
                        let options = {
                            uri: element.IdUrl,
                            transform: (body) => 
                            {
                                return cheerio.load(body);
                            }
                        };

                        rp(options)
                            .then(($) => 
                            {
                                setTimeout(() => 
                                {
                                    id = Exports.indexOf(element);
                                    //console.log(id);
                                    element.Valor = $('tr[class=remuneracaolinhatotalliquida]').children('td[class=colunaValor]').html();
                                    Exports[id] = element;
                                    //Exports.push(element);
                                    console.log(element);
                                },2000);
                            })
                            .catch((err) => 
                            {
                                console.log(err);
                            });
                    });
                }
            });
        });
    })
    .catch((err) => 
    {
        console.log(err);
    });
