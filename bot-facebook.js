/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Botkit = require('botkit');
var request = require('request');

var controller = Botkit.facebookbot({
    access_token: process.env.FB_ACCESS_TOKEN,
    verify_token: process.env.FB_VERIFY_TOKEN
});

var bot = controller.spawn();
controller.hears('(.*)', 'message_received', function (bot, message) {
    console.log('passou');
    //Watson Context
    var context = message.watsonData.context;

    if (context.financiar) {
        console.log("Credito api invoked..");
        var prazo = context.prazo;
        var valor = context.valor;
        var carencia = context.carencia;
        
        console.log(prazo);
        console.log(valor);
        console.log(carencia);
        var options = {
            url: "http://credito-pessoal-api.mybluemix.net/bv/api/v0/creditoPessoal/values?parcelas=" + prazo + "&carencia=" + carencia + "&valor=" + valor,
            method: "GET",
            accept: "application/json"
        }

        function callback(error, response, body) {
            console.log(JSON.stringify(body));
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                console.log(JSON.stringify(info));
                bot.reply(message, "O valor do seu financiamento ficará em R$ "+info.simulacao.valorParcelas+" por mês.");

            } else {
                //Error handle
                console.log('Error credtio..');
                bot.reply(message, "Desculpe, um erro ocorreu! Tente novamente.");

            }

        }

        request(options, callback);

    } else {

        bot.reply(message, message.watsonData.output.text.join('\n'));
    }
});

module.exports.controller = controller;
module.exports.bot = bot;
