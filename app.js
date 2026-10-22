(function(){
  'use strict';
  var app = document.getElementById('app');
  var I = {
    flor:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22V12"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 12c0-4-3-7-7-7 0 4 3 7 7 7z"/></svg>',
    ok:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    okp:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    zap:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12z"/></svg>'
  };
  var QS = [
    {key:'quem', tipo:'um', pergunta:'Para quem é este guia?', ajuda:'Assim a gente escreve do jeito certo.',
      opcoes:[{v:'eu',label:'Para a minha família'},{v:'outra',label:'Para uma família que eu ajudo'}]},
    {key:'inss', tipo:'varios', pergunta:'A pessoa recebia algum dinheiro do INSS?', ajuda:'Marque todos que ela recebia. Pode ser mais de um.',
      opcoes:[{v:'apos',label:'Aposentadoria, de qualquer tipo'},{v:'doenca',label:'Auxílio-doença ou outro benefício por doença ou acidente'},{v:'pens',label:'Pensão de alguém que já tinha falecido'},{v:'bpc',label:'LOAS ou BPC (às vezes chamado de “aposentadoria do LOAS”)',sub:'Um salário mínimo pago a idosos de 65 anos ou mais e a pessoas com deficiência de baixa renda, mesmo sem ter pago o INSS.',so:true},{v:'nao',label:'Não recebia nada',so:true},{v:'naosei',label:'Não sei',so:true}]},
    {key:'carteira', tipo:'um', pergunta:'A pessoa já trabalhou de carteira assinada?',
      ajuda:'Serve para saber se ficou FGTS ou PIS para a família sacar.',
      ajudaApos:'Mesmo aposentada, pode ter ficado FGTS ou PIS de empregos antigos para a família sacar. E algumas pessoas aposentadas continuam trabalhando.',
      opcoes:[{v:'sim',label:'Sim, ainda trabalhava quando faleceu'},{v:'antes',label:'Sim, mas há algum tempo'},{v:'nunca',label:'Nunca trabalhou de carteira'},{v:'naosei',label:'Não sei'}]},
    {key:'ficou', tipo:'varios', pergunta:'Quem ficou e dependia da pessoa?', ajuda:'Marque todas que servem.',
      opcoes:[{v:'conj',label:'Esposa, marido ou companheiro(a)'},{v:'f16',label:'Filhos com menos de 16 anos'},{v:'f21',label:'Filhos de 16 a 20 anos'},{v:'fdef',label:'Filho com deficiência, de qualquer idade'},{v:'outros',label:'Pais ou irmãos que dependiam dela'},{v:'ninguem',label:'Ninguém dependia',so:true}]},
    {key:'bens', tipo:'um', pergunta:'A pessoa deixou casa, terreno ou carro?', ajuda:'No nome dela, ou em parte no nome dela.',
      opcoes:[{v:'sim',label:'Sim'},{v:'nao',label:'Não'},{v:'naosei',label:'Não sei'}]},
    {key:'consig', tipo:'um', pergunta:'Ela tinha empréstimo descontado do benefício ou do salário?', ajuda:'É o chamado empréstimo consignado.',
      opcoes:[{v:'sim',label:'Sim'},{v:'nao',label:'Não'},{v:'naosei',label:'Não sei'}]},
    {key:'aperto', tipo:'um', pergunta:'A família está com dificuldade de dinheiro agora?', ajuda:'Por exemplo, para o enterro ou para as contas da casa.',
      opcoes:[{v:'sim',label:'Sim, estamos precisando'},{v:'nao',label:'Não, conseguimos nos virar'}]}
  ];
  function novo(){ return {tela:'intro', qi:0, quem:null, inss:[], carteira:null, ficou:[], bens:null, consig:null, aperto:null, feitos:{}}; }
  var s = novo();
  var VERSAO = 'luto-1';
  function fbNovo(){ return {etapa:'pergunta', voto:null, id:null, chave:null, texto:''}; }
  var fb = fbNovo();
  function enviarFeedback(dados){
    if (!/^https?:$/.test(location.protocol) || !window.fetch) return Promise.resolve(null);
    return fetch('/api/feedback', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(dados), keepalive:true})
      .then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; });
  }
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function tem(v){ return s.ficou.indexOf(v) >= 0; }

  function topo(){
    return '<div class="teste">Protótipo · informações em revisão por advogado</div>' +
      '<div class="marca"><span class="ico">' + I.flor + '</span>Guia do Luto</div>';
  }

  /* Monta o passo a passo de acordo com as respostas */
  function montar(){
    var voce = s.quem === 'eu';
    function rec(v){ return s.inss.indexOf(v) >= 0; }
    var recebia = s.inss.length > 0 && !rec('nao');
    /* Quem era aposentado, recebia benefício por doença ou trabalhava de carteira era segurado: pode deixar pensão */
    var segurado = rec('apos') || rec('doenca') || s.carteira === 'sim';
    var soBPC = rec('bpc') && !segurado;
    var soPensao = rec('pens') && !segurado && !rec('bpc');
    var talvez = !segurado && !soBPC && !soPensao; /* não recebia nada ou não sabe */
    var dependentes = tem('conj') || tem('f16') || tem('f21') || tem('fdef') || tem('outros');
    var prazoPensao = tem('f16') ? '180 dias para os filhos com menos de 16 anos e 90 dias para os demais' : '90 dias';
    var E = {h24:[], semana:[], mes:[], depois:[]};
    /* Linha curta de cada passo para a mensagem de WhatsApp */
    var Z = {
      'declaracao':'O hospital, o médico ou o serviço que atendeu entrega.',
      'cartorio':'De graça. Prazo de 24 horas (a lei aceita até 15 dias). Levar a declaração de óbito e um documento da pessoa.',
      'cras-funeral':'O CRAS pode ajudar com o funeral e com as necessidades urgentes.',
      'recibos':'Quem pagou o funeral pode ser reembolsado depois.',
      'nao-sacar':'Esse dinheiro terá que ser devolvido.',
      'avisar-inss':'Pelo Meu INSS ou pelo telefone 135.',
      'dinheiro-conta':'Guardar os recibos, anotar quanto tirou e para quê, e conversar com os outros herdeiros.',
      'documentos':'RG e CPF da pessoa, certidão de óbito, certidão de casamento ou prova de união, documentos dos filhos e comprovante de endereço.',
      'empresa':'Salário e acertos vão para os dependentes, sem inventário.',
      'bpc':'Procurar o CRAS para ver outros apoios, como o Bolsa Família.',
      'pensao':'Para receber desde o dia do falecimento, peça em até ' + prazoPensao + '. De graça, pelo Meu INSS ou pelo 135.',
      'pais':'Só têm direito se não houver esposa, marido ou filhos, e se provarem que dependiam.',
      'residuo':'No Meu INSS: “Solicitar valor não recebido”.',
      'fgts':'Na Caixa, sem inventário. Levar a certidão de óbito e a declaração de dependentes do INSS.',
      'cadunico':'Evita perder benefícios e pode aumentar o Bolsa Família.',
      'svr':'No site Valores a Receber, do Banco Central, com a conta gov.br. De graça.',
      'inventario':'Prazo de 2 meses para começar. Alguns estados cobram multa se atrasar. A Defensoria Pública faz de graça.',
      'casa':'Em geral, ela não pode ser tomada para pagar dívidas.',
      'sem-inventario':'Dinheiro pequeno na conta pode ser liberado com autorização do juiz. A Defensoria pede de graça.',
      'consignado':'Os descontos param. Pedir o contrato ao banco e procurar a Defensoria antes de pagar ou assinar qualquer coisa.'
    };
    function add(etapa, id, titulo, texto, chip){ E[etapa].push({id:id, titulo:titulo, texto:texto, chip:chip}); }

    add('h24','declaracao','Pegar a declaração de óbito','Quem entrega é o hospital, o médico ou o serviço que atendeu. Ela é necessária para o enterro e para o cartório.','urg');
    add('h24','cartorio','Registrar o óbito no cartório','Leve a declaração de óbito e um documento da pessoa. O registro e a primeira certidão são de graça para todos. O prazo é de 24 horas, e a lei aceita até 15 dias.','urg');
    if (s.aperto === 'sim') add('h24','cras-funeral','Pedir ajuda ao CRAS para o enterro','A assistência social da sua cidade pode ajudar com o funeral e com as necessidades urgentes da família. O valor e as regras mudam de cidade para cidade.','dir');
    add('h24','recibos','Guardar todos os recibos do funeral','Esse gasto pode ser pago depois com o dinheiro que a pessoa deixou. Quem pagou do próprio bolso pode ser reembolsado.','ate');

    if (recebia) add('semana','nao-sacar','Não sacar o dinheiro que o INSS depositar depois do falecimento','Esse dinheiro terá que ser devolvido. O valor dos dias que a pessoa viveu no mês é da família e pode ser pedido (veja no primeiro mês).','urg');
    if (recebia) add('semana','avisar-inss','Avisar o INSS','Pelo Meu INSS ou pelo telefone 135. O cartório também avisa, mas às vezes demora.','ate');
    if (s.aperto === 'sim') add('semana','dinheiro-conta','Se precisar usar o dinheiro da conta','Sabemos que muitas famílias precisam desse dinheiro na hora. Se usar o que já estava na conta, guarde os recibos, anote quanto tirou e para quê, e converse com os outros herdeiros.','ate');
    add('semana','documentos','Juntar os documentos','RG e CPF de quem faleceu, certidão de óbito, certidão de casamento ou prova de união, documentos dos filhos e comprovante de endereço.', 'ate');
    if (s.carteira === 'sim') add('semana','empresa','Avisar a empresa onde a pessoa trabalhava','O salário e os acertos que a empresa deve são pagos aos dependentes, sem inventário.','dir');

    if (soPensao) {
      add('mes','pensao-termina','A pensão que a pessoa recebia termina','Em geral, a pensão que ela recebia de outra pessoa que já tinha falecido acaba e não passa para a família. Confirme pelo telefone 135 ou com a Defensoria Pública, porque há exceções.','ate');
    } else if (soBPC) {
      add('mes','bpc','O LOAS (BPC) não deixa pensão','O LOAS termina com o falecimento e não passa para a família. Procure o CRAS para ver outros apoios, como o Bolsa Família.','ate');
    } else if (dependentes) {
      add('mes','pensao','Pedir a pensão por morte',(talvez ? 'A família pode ter direito se a pessoa pagava o INSS, como autônoma ou MEI, ou se trabalhou de carteira nos últimos meses. ' : '') + 'Peça em até ' + prazoPensao + ' para receber desde o dia do falecimento. É de graça, pelo Meu INSS ou pelo telefone 135. ' + (tem('conj') ? 'Para o(a) companheiro(a), a duração depende da idade e do tempo de união.' : ''),'urg');
    }
    if (tem('outros') && !soBPC && !soPensao) add('mes','pais','Pais e irmãos precisam provar que dependiam','Eles só têm direito à pensão se não houver esposa, marido ou filhos, e se mostrarem que dependiam do dinheiro da pessoa.','ate');
    if (recebia) add('mes','residuo','Pedir o valor que ficou para trás','O dinheiro dos dias que a pessoa viveu no mês do falecimento é da família. No Meu INSS, procure “Solicitar valor não recebido”.','dir');
    if (s.carteira !== 'nunca') add('mes','fgts','Sacar o FGTS e o PIS','Os dependentes da pensão sacam na Caixa, sem inventário. Leve a certidão de óbito e a declaração de dependentes do INSS.','dir');
    add('mes','cadunico','Atualizar o Cadastro Único no CRAS','A família mudou e a renda pode ter caído. Atualizar evita perder benefícios e pode dar direito ao Bolsa Família ou a um valor maior.','dir');
    add('mes','svr','Ver se ficou dinheiro esquecido no banco','No site Valores a Receber, do Banco Central, com a sua conta gov.br e o CPF de quem faleceu. É de graça.','dir');

    if (s.bens === 'sim' || s.bens === 'naosei') {
      add('depois','inventario','Fazer o inventário','É o processo que passa a casa, o terreno ou o carro para os herdeiros. O prazo é de 2 meses, e alguns estados cobram multa no imposto se atrasar. Não precisa ser agora, mas faça. A Defensoria Pública faz de graça.','urg');
      add('depois','casa','A casa onde a família mora está protegida','Em geral, ela não pode ser tomada para pagar dívidas de quem faleceu.','dir');
    } else {
      add('depois','sem-inventario','Sem casa nem carro, em geral não precisa de inventário','Dinheiro pequeno na conta ou na poupança pode ser liberado com uma autorização do juiz. A Defensoria Pública pede de graça.','dir');
    }
    if (s.consig === 'sim' || s.consig === 'naosei') add('depois','consignado','Empréstimo: não pague com o seu dinheiro','Os descontos param com o falecimento e não passam para a pensão. Peça o contrato ao banco e pergunte se havia seguro. Se o banco cobrar, procure a Defensoria antes de pagar ou assinar qualquer coisa.','ate');

    return {E:E, voce:voce, Z:Z};
  }

  var ETAPAS = [
    {k:'h24', nome:'Nas primeiras 24 horas'},
    {k:'semana', nome:'Na primeira semana'},
    {k:'mes', nome:'No primeiro mês'},
    {k:'depois', nome:'Nos próximos meses'}
  ];
  var CHIP = {urg:'Tem prazo', dir:'Direito da família', ate:'Atenção'};

  function telaIntro(){
    return topo() +
      '<section class="card"><h1 class="h1">Sentimos muito pela sua perda</h1>' +
      '<p class="lead">Este guia mostra, em ordem, o que fazer agora e o que pode esperar. Também mostra os direitos que a família pode ter.</p></section>' +
      '<div class="checks">' +
      ['São 7 perguntas rápidas','Não pedimos nome nem documento','Tudo o que aparece aqui é gratuito'].map(function(t){ return '<div>'+I.ok+'<span>'+t+'</span></div>'; }).join('') +
      '</div><button type="button" class="btn" data-a="comecar">Começar</button>';
  }

  function telaPergunta(){
    var q = QS[s.qi], n = QS.length, pct = Math.round((s.qi + 1) / n * 100);
    var h = topo() +
      '<div class="prog"><div>Pergunta ' + (s.qi + 1) + ' de ' + n + '</div><div class="bar"><div id="barra"></div></div></div>' +
      '<h2 class="h2" id="perg">' + esc(q.pergunta) + '</h2><p class="ajuda">' + esc(q.ajudaApos && s.inss.indexOf('apos') >= 0 ? q.ajudaApos : q.ajuda) + '</p>';
    if (q.tipo === 'um') {
      h += '<div class="opts" role="group" aria-labelledby="perg">' + q.opcoes.map(function(o, i){
        return '<button type="button" class="opt" data-a="um" data-i="' + i + '">' + esc(o.label) + '</button>'; }).join('') + '</div>';
    } else {
      var marc = s[q.key];
      h += '<div class="opts" role="group" aria-labelledby="perg">' + q.opcoes.map(function(o, i){
        return '<button type="button" class="opt" data-a="varios" data-i="' + i + '" aria-pressed="' + (marc.indexOf(o.v) >= 0) + '"><span class="box">' + I.okp + '</span><span class="opt-txt"><span>' + esc(o.label) + '</span>' + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span></button>'; }).join('') + '</div>' +
        '<button type="button" class="btn" data-a="continuar" aria-disabled="' + (marc.length === 0) + '">' + (marc.length ? 'Continuar' : 'Marque pelo menos uma') + '</button>';
    }
    return h + '<button type="button" class="link" data-a="voltar">Voltar</button>';
  }

  function mensagem(r){
    var E = r.E, Z = r.Z, feitos = [];
    var m = 'Passo a passo depois do falecimento\n';
    ETAPAS.forEach(function(e){
      var pend = E[e.k].filter(function(p){ if (s.feitos[p.id]) { feitos.push(p); return false; } return true; });
      if (!pend.length) return;
      m += '\n*' + e.nome.toUpperCase() + '*\n';
      pend.forEach(function(p){ m += '• *' + p.titulo + '*\n' + (Z[p.id] ? '   ' + Z[p.id] + '\n' : ''); });
    });
    if (feitos.length) {
      m += '\n*JÁ FEITO*\n';
      feitos.forEach(function(p){ m += '✔ ' + p.titulo + '\n'; });
    }
    m += '\nTudo isso é gratuito. Ajuda: CRAS, Defensoria Pública, INSS 135, Disque Social 121.';
    return m;
  }

  function telaResultado(){
    var r = montar(), E = r.E, total = 0, feitos = 0;
    ETAPAS.forEach(function(e){ E[e.k].forEach(function(p){ total++; if (s.feitos[p.id]) feitos++; }); });
    var h = topo() +
      '<section class="acolhe"><h2>' + (r.voce ? 'Um passo de cada vez' : 'O passo a passo para essa família') + '</h2>' +
      '<p>' + (r.voce ? 'Você não precisa resolver tudo hoje. Comece pelo que tem prazo e marque o que já foi feito.' : 'Comece pelo que tem prazo. Você pode marcar o que já foi feito e mandar a lista pelo WhatsApp.') + '</p>' +
      '<p class="feitos">' + feitos + ' de ' + total + ' passos feitos</p>' +
      '<p>Toque no quadrado quando terminar um passo.</p></section>';
    ETAPAS.forEach(function(e){
      if (!E[e.k].length) return;
      h += '<section class="etapa" aria-labelledby="et-' + e.k + '"><div class="etapa-top"><h3 id="et-' + e.k + '">' + e.nome + '</h3><span>' + E[e.k].length + (E[e.k].length === 1 ? ' passo' : ' passos') + '</span></div>' +
        E[e.k].map(function(p){
          var f = !!s.feitos[p.id];
          return '<article class="passo' + (f ? ' feito' : '') + (p.chip === 'urg' && !f ? ' urgente' : '') + '">' +
            '<button type="button" class="marcar" data-a="feito" data-id="' + p.id + '" aria-pressed="' + f + '" aria-label="Marcar como feito: ' + esc(p.titulo) + '">' + I.okp + '</button>' +
            '<div class="passo-txt"><span class="chip ' + p.chip + '">' + CHIP[p.chip] + '</span><b>' + esc(p.titulo) + '</b><p>' + esc(p.texto) + '</p></div></article>';
        }).join('') + '</section>';
    });
    h += '<section class="cuidado"><h3>Cuidado com golpes</h3><ul>' +
      '<li>Pedir a pensão no INSS é de graça. Desconfie de quem cobra para “agilizar”.</li>' +
      '<li>O INSS e o Banco Central não mandam links nem pedem senha por mensagem.</li>' +
      '<li>Não assine nada com banco ou empresa antes de entender o que é.</li></ul></section>';
    h += '<section class="ajudas"><h3>Onde pedir ajuda de graça</h3><ul>' +
      '<li><b>CRAS</b> da sua cidade: funeral, Cadastro Único e benefícios</li>' +
      '<li><b>Defensoria Pública</b>: inventário, alvará e dívidas</li>' +
      '<li><b>INSS, telefone 135</b>: pensão e valores que ficaram para trás</li>' +
      '<li><b>Disque Social 121</b>: dúvidas sobre programas sociais</li></ul></section>';
    h += '<section class="ajudas"><h3>O que vai na mensagem</h3><ul class="lista-zap">' +
      '<li><span aria-hidden="true">•</span> O que falta fazer vai completo, com prazo e onde ir.</li>' +
      '<li><span aria-hidden="true">✔</span> O que você marcou como feito vai no fim, só com o nome.</li></ul></section>';
    h += '<a class="btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + encodeURIComponent(mensagem(r)) + '">' + I.zap + 'Mandar a lista pelo WhatsApp</a>' +
      '<button type="button" class="link" data-a="recomecar">Responder de novo</button>' +
      telaFeedback() +
      '<p class="rodape">Protótipo. As informações estão sendo revisadas por advogado e não substituem a orientação da Defensoria Pública ou do INSS.</p>';
    return h;
  }

  function telaFeedback(){
    var h = '<section class="card fb-card" aria-labelledby="fb-tit">';
    if (fb.etapa === 'pergunta') {
      h += '<h3 id="fb-tit">Este guia ajudou?</h3><div class="fb-botoes">' +
        '<button type="button" class="fb-btn" data-a="fb-voto" data-v="sim">Sim, ajudou</button>' +
        '<button type="button" class="fb-btn" data-a="fb-voto" data-v="nao">Não ajudou</button></div>';
    } else if (fb.etapa === 'coment') {
      var n = fb.texto.trim().length;
      h += '<h3 id="fb-tit" tabindex="-1">Obrigada por responder</h3>' +
        '<label for="fb-texto" class="fb-label">Faltou algum passo ou alguma coisa ficou confusa? (opcional)</label>' +
        '<p class="fb-aviso">Não escreva nomes, telefone, CPF nem detalhes sobre a pessoa que faleceu.</p>' +
        '<textarea id="fb-texto" maxlength="300" rows="4">' + esc(fb.texto) + '</textarea>' +
        '<p class="fb-conta" id="fb-conta">' + fb.texto.length + ' de 300 letras</p>' +
        '<button type="button" class="btn" data-a="fb-enviar" aria-disabled="' + (n === 0) + '">Enviar</button>' +
        '<button type="button" class="link" data-a="fb-pular">Não quero escrever</button>';
    } else {
      h += '<h3 id="fb-tit" tabindex="-1">Recebemos. Obrigada!</h3><p class="ajuda">Sua resposta ajuda a melhorar o guia para outras famílias.</p>';
    }
    return h + '</section>';
  }
  function passosMostrados(){
    var E = montar().E, ids = [];
    ETAPAS.forEach(function(e){ E[e.k].forEach(function(p){ ids.push(p.id); }); });
    return ids;
  }

  function render(foco){
    app.innerHTML = s.tela === 'intro' ? telaIntro() : s.tela === 'q' ? telaPergunta() : telaResultado();
    var b = document.getElementById('barra'); if (b) b.style.width = Math.round((s.qi + 1) / QS.length * 100) + '%';
    if (foco){ window.scrollTo(0, 0); var t = app.querySelector('h1,h2'); if (t){ t.setAttribute('tabindex','-1'); t.focus({preventScroll:true}); } }
  }
  function avancar(){ s.qi++; if (s.qi >= QS.length) s.tela = 'res'; render(true); }

  app.addEventListener('click', function(e){
    var b = e.target.closest('[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a'), q = QS[s.qi];
    if (a === 'comecar'){ s.tela = 'q'; s.qi = 0; render(true); }
    else if (a === 'um'){ s[q.key] = q.opcoes[+b.getAttribute('data-i')].v; avancar(); }
    else if (a === 'varios'){
      var v = q.opcoes[+b.getAttribute('data-i')].v, arr = s[q.key];
      if (arr.indexOf(v) >= 0) arr = arr.filter(function(x){ return x !== v; });
      else if (q.opcoes.some(function(o){ return o.v === v && o.so; })) arr = [v];
      else arr = arr.filter(function(x){ return !q.opcoes.some(function(o){ return o.v === x && o.so; }); }).concat([v]);
      s[q.key] = arr; render(false);
    }
    else if (a === 'continuar'){ if (b.getAttribute('aria-disabled') === 'true') return; avancar(); }
    else if (a === 'voltar'){ if (s.qi <= 0) s.tela = 'intro'; else s.qi--; render(true); }
    else if (a === 'feito'){
      var id = b.getAttribute('data-id'); s.feitos[id] = !s.feitos[id];
      var y = window.scrollY; render(false); window.scrollTo(0, y);
      var nb = app.querySelector('[data-id="' + id + '"]'); if (nb) nb.focus({preventScroll:true});
    }
    else if (a === 'fb-voto'){
      fb.voto = b.getAttribute('data-v'); fb.etapa = 'coment';
      enviarFeedback({voto:fb.voto, ferramenta:'luto', beneficios:passosMostrados(), versao:VERSAO})
        .then(function(r){ if (r && r.id){ fb.id = r.id; fb.chave = r.chave; } });
      var y1 = window.scrollY; render(false); window.scrollTo(0, y1);
      var t1 = document.getElementById('fb-tit'); if (t1) t1.focus({preventScroll:true});
    }
    else if (a === 'fb-enviar' || a === 'fb-pular'){
      if (a === 'fb-enviar'){
        var txt = fb.texto.trim(); if (!txt) return;
        enviarFeedback({voto:fb.voto, ferramenta:'luto', id:fb.id, chave:fb.chave, comentario:txt});
      }
      fb.etapa = 'final';
      var y2 = window.scrollY; render(false); window.scrollTo(0, y2);
      var t2 = document.getElementById('fb-tit'); if (t2) t2.focus({preventScroll:true});
    }
    else if (a === 'recomecar'){ s = novo(); fb = fbNovo(); render(true); }
  });
  app.addEventListener('input', function(e){
    if (e.target.id !== 'fb-texto') return;
    fb.texto = e.target.value;
    var c = document.getElementById('fb-conta'); if (c) c.textContent = fb.texto.length + ' de 300 letras';
    var bt = app.querySelector('[data-a="fb-enviar"]'); if (bt) bt.setAttribute('aria-disabled', String(fb.texto.trim().length === 0));
  });
  render(false);
})();
