/**
 * ============================================================================
 * NOTAS DE IMPLEMENTAÇÃO MARTECH - CASE DP6
 * ============================================================================
 * 1. INICIALIZAÇÃO DO GTM:
 *    O snippet do contêiner (GTM-NPNR7P2B) foi inserido no <head> dos arquivos 
 *    HTML (index.html, analise.html, sobre.html) seguindo os padrões oficiais.
 * 
 * 2. CONVENÇÃO DE NOMENCLATURA DA CAMADA DE DADOS:
 *    Eventos personalizados utilizam o prefixo 'custom_' (ex: custom_click_contato, 
 *    custom_file_download, custom_form_start) para isolar as chamadas de aplicação 
 *    dos disparos nativos e automáticos do GTM (ex: gtm.click, gtm.js).
 * 
 * 3. MAPEAMENTO DAS TAGS NO GTM:
 *    No painel do GTM, os acionadores escutam 'custom_(nome do evento)' e disparam 
 *    os nomes nativos exigidos pelo case: 'click', 'file_download', 'form_start', 
 *    'form_submit' e 'view_form_success'.
 * ============================================================================
 */

$(document).ready(function() {

  // ==========================================================================
  // SEÇÃO 1: EVENTOS DO MENU GLOBAL (Todas as Páginas)
  // ==========================================================================

  // Evento: Clique no link "Entre em Contato"
  $(document).on('click', '.menu-lista-contato', function() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'custom_click_contato',
      page_location: window.location.href,
      element_name: 'entre_em_contato',
      element_group: 'menu'
    });
  });

  // Evento: Clique no link "Download PDF"
  $(document).on('click', '.menu-lista-download', function() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'custom_file_download',
      page_location: window.location.href,
      element_name: 'download_pdf',
      element_group: 'menu'
    });
  });


  // ==========================================================================
  // SEÇÃO 2: EVENTOS DA PÁGINA DE ANÁLISE (analise.html)
  // ==========================================================================

  // Evento: Clique nos botões "Ver Mais" (Cards: Lorem, Ipsum, Dolor)
  $(document).on('click', '.card-montadoras', function() {
    var cardId = $(this).attr('data-id'); // Resgata 'lorem', 'ipsum' ou 'dolor'
    
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'custom_ver_mais',
      page_location: window.location.href,
      element_name: cardId,
      element_group: 'ver_mais'
    });
  });


// ==========================================================================
  // SEÇÃO 3: FUNIL DO FORMULÁRIO DA PÁGINA SOBRE (sobre.html)
  // ==========================================================================

  var formStarted = false; // Controle para o disparo único do form_start por tentativa

  // Funções auxiliares para capturar os atributos do formulário
  function getFormId($form) {
    return $form.attr('id') || $form.attr('class') || 'contato';
  }

  function getFormName($form) {
    return $form.attr('name') || $form.attr('class') || 'contato';
  }

  function getFormDestination($form) {
    return $form.attr('action') || window.location.href;
  }

  // Função que monitora o surgimento do pop-up logo após o clique de envio
  function monitorarExibicaoSucesso($form) {
    var tentativas = 0;
    var checagem = setInterval(function() {
      tentativas++;
      var $lightbox = $('.lightbox');

      // Detecta quando a modal transiciona para visível na tela
      if ($lightbox.is(':visible') && parseFloat($lightbox.css('opacity')) > 0) {
        clearInterval(checagem); // Interrompe o monitoramento

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'custom_view_form_success',
          page_location: window.location.href,
          form_id: getFormId($form),
          form_name: getFormName($form)
        });
      }

      // Limite de segurança: para de checar após 3 segundos caso a modal não abra
      if (tentativas > 30) {
        clearInterval(checagem);
      }
    }, 100);
  }

  // 1. Evento: form_start (Dispara na primeira interação com qualquer campo)
  $(document).on('input change', 'form input, form textarea, form select', function() {
    if (!formStarted) {
      formStarted = true;
      var $form = $(this).closest('form');

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'custom_form_start',
        page_location: window.location.href,
        form_id: getFormId($form),
        form_name: getFormName($form),
        form_destination: getFormDestination($form)
      });
    }
  });

  // 2. Evento: form_submit (Dispara a cada envio do formulário)
  $(document).on('submit', 'form', function() {
    var $form = $(this);
    var submitText = $form.find('button[type="submit"], input[type="submit"]').text().trim() || 'Enviar';

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'custom_form_submit',
      page_location: window.location.href,
      form_id: getFormId($form),
      form_name: getFormName($form),
      form_destination: getFormDestination($form),
      form_submit_text: submitText
    });

    // Inicia o monitoramento para disparar o view_form_success assim que o pop-up abrir
    monitorarExibicaoSucesso($form);
  });

  // 3. Reset do form_start ao fechar o pop-up (Permite novos disparos em envios futuros)
  $(document).on('click', '.lightbox-fechar, .lightbox-backdrop', function() {
    formStarted = false;
  });
});