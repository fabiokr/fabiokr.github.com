---
layout: blog-post
title: "Segmentation fault no apache ao fazer Code Coverage com Cakephp"
date: 2010-03-23 00:00
categories: [Php, Cakephp]
---
 Tive problemas ao tentar usar o Xdebug com os testes no CakePHP. Meu ambiente é um Ubuntu 9.10, Apache 2, PHP 5 com XDebug instalado via apt-get. Ao tentar executar os testes no Cake com code coverage report, o processo morria, e o seguinte erro aparecia no log do Apache:

>[Tue Mar 23 09:58:38 2010] [notice] child pid 16792 exit signal Segmentation fault (11)


Encontrei
[nesta](\"\\"http://mark-story.com/posts/view/code-coverage-in-cakephp-1-2-test-suite\\"\") página uma solução que resolveu meu problema:

Altere a linha 115 do arquivo cake/tests/lib/code_coverage_manager.php para:

>xdebug_start_code_coverage(XDEBUG_CC_UNUSED);


Pronto! 
