---
layout: blog-post
title: "Instalando Bazaar server como serviço em windows server 2008"
date: 2010-03-22 00:00
categories: [Bzr, Bazaar, Windows]
---
Aqui na empresa estamos usando o Bazaar como sistema de controle de versío. Estamos utilizando um repositório compartilhado em rede, mas estamos tendo muitos problemas com o Bazaar nío conseguindo liberar os locks das pastas apí³s dar commits.

Sendo assim, decidi tentar usar o 
[servidor especí­fico do Bazaar](\"\\"http://doc.bazaar.canonical.com/bzr.2.1/en/admin-guide/simple-setups.html\\"\") no Windows, instalando-o como um serviço.

Seguem os passos para instalá-lo no Windows Server 2008:

1 - Instalar o Bazaar normalmente no Windows Server.

2 - Instalar o 
[Resource Kit Tools](\"\\"http://www.microsoft.com/downloads/details.aspx?FamilyID=9D467A69-57FF-4AE7-96EE-B18C4790CFFD&displaylang=en\\"\"). Esta versío é para Windows Server 2003, mas nío tive problemas usando-o no 2008 (nío encontrei versío do Resource Kit Tools para o 2008). Precisamos do Resource Kit Tools porque ele contém o Srvany, que permite instalar qualquer executável como um serviço do Windows.

3 - Criar um serviço para o Bazaar: na linha de comando do Windows Server, digite 'sc create bzr_server binPath= C:\\\\Program Files (x86)\\\\Windows Resource Kits\\\\Tools\\\\srvany.exe DisplayName= \\"Bazaar Server\\"', levando em conta o caminho correto de onde o Resource Kit Tools foi instalado.

4 - Devemos agora configurar qual executável o srvany irá rodar como serviço. Para isso devemos editar o registro do Windows com o programa 'regedit'. Procure pela chave HKEY_LOCAL_MACHINE\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\bzr_server, e adicione uma chave chamada 'Parameters'. Dentro da chave Parameters, crie um valor do tipo string chamado 'Application' e tendo como valor o caminho para o bzr server. No meu caso ficou assim:  

bzr server --directory=G:\\\\Repositorios --port=0.0.0.0:4155 --allow-writes

Pronto! Basta agora iniciar o serviço no Windows e vocíª deverá conseguir acessar o repositorio. Para testá-lo vocíª pode tentar o seguinte comando:

bzr check bzr://localdarede/pasta_do_repositorio

Espero que agora os problema com break-lock se resolvam =S
