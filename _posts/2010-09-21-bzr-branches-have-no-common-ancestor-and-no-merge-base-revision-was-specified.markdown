---
layout: blog-post
title: "Bzr: Branches have no common ancestor, and no merge base revision was specified"
date: 2010-09-21 00:00
categories: [Bzr, Bazaar]
---
Aqui na empresa, temos um projeto base. Os projetos aqui desenvolvidos herdam deste projeto base.

Também, utilizamos o Bazaar como sistema de versionamento de código.

Quando vamos criar um projeto novo, precisamos fazer com que ele herde do projeto base. A solu

ção que estamos utilizando é criar um novo branch para o novo projeto, e então fazer um merge com o projeto base. Assim, dali em diante conseguimos fazer updates a partir do projeto base. Porém, quando vai-se fazer o merge com o projeto base pela primeira vez, o seguinte erro é lançado:

```
bzr: ERROR: Branches have no common ancestor, and no merge base revision was specified
```

Isso acontece porque o novo branch ainda não tem um ancestral comum com o branch do projeto base, sendo assim o bzr não tem como saber a partir do que ele deve fazer o merge.

Neste caso, deve-se especificar o merge manualmente.  O seguinte comando (executado a partir da raiz do novo projeto) explicita isso:

```
bzr merge -r 0..-1 caminho/do/projeto/base
```

Assim, o Bazaar irá fazer o merge com o projeto base da revisão 0 até a última possí­vel (-1). Deste momento em diante, os dois projetos terão um ancestral comum e será possí­vel fazer merges com o projeto base sem mais problemas.
