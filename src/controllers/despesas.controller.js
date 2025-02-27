const CampoNaoEncontrado = require("../errors/campoNaoEncontrado")
const NenhumItemEncontrado = require("../errors/nenhumItemEncontrado")
const CampoInvalido = require("../errors/campoInvalido")
const ItemJaCadastrado = require("../errors/itemJaCadastrada")
const { CategoriaInvalida } = require("../errors")
const tableDespesas = require("../models").Despesas

class DespesasController {
  static async listarDespesas(req, res, next) {
    try {
      const parametros = req.query
      const camposBusca = ["id", "descricao", "valor", "data"]
      const despesas = await tableDespesas.findAll({
        attributes: camposBusca,
      })

      if (despesas.length === 0) {
        throw new NenhumItemEncontrado()
      }

      if (parametros["descricao"]) {
        const palavraEncontrar = parametros["descricao"]
        const despesasEncontradas = []
        despesas.forEach((despesa) => {
          const descricaoPorPalavra = despesa["descricao"].split(" ")
          if (descricaoPorPalavra.indexOf(palavraEncontrar) !== -1) {
            despesasEncontradas.push(despesa)
          }
        })

        return res.status(200).json({
          Palavra: palavraEncontrar,
          despesasEncontradas: despesasEncontradas,
        })
      }

      return res.status(200).json(despesas)
    } catch (error) {
      return next(error)
    }
  }

  static async mostraDespesa(req, res, next) {
    const { id } = req.params
    try {
      const despesa = await tableDespesas.findOne({
        where: { id: id },
        attributes: ["id", "descricao", "valor", "data"],
      })
      if (!despesa) {
        throw new NenhumItemEncontrado()
      }
      return res.status(200).json(despesa)
    } catch (error) {
      return next(error)
    }
  }

  static async cadastrarDespesa(req, res, next) {
    const novaDespesa = req.body
    try {
      const camposObrigatorios = ["descricao", "valor", "data"]
      camposObrigatorios.forEach((campo) => {
        if (!novaDespesa[campo]) {
          throw new CampoNaoEncontrado(campo)
        }
      })
      const categoria = novaDespesa["categoria"]
      if (!categoria) {
        novaDespesa["categoria"] = "Outras"
      }
      const possiveisCategorias = [
        "Transporte",
        "Saúde",
        "Alimentação",
        "Lazer",
        "Imprevistos",
        "Educação",
        "Moradia",
        "Outras",
      ]

      if (possiveisCategorias.indexOf(categoria) === -1) {
        throw new CategoriaInvalida()
      }
      const mesDespesaAdicionar = new Date(novaDespesa["data"]).getMonth() + 1
      const descricaoDespesaAdicionar = novaDespesa["descricao"]

      const despesasExistentes = await tableDespesas.findAll()
      despesasExistentes.forEach((despesa) => {
        const mesDespesa = new Date(despesa["data"]).getMonth() + 1
        const descricaoDespesa = despesa["descricao"]
        if (
          mesDespesa === mesDespesaAdicionar &&
          descricaoDespesa === descricaoDespesaAdicionar
        ) {
          throw new ItemJaCadastrado()
        }
      })
      const despesaAdicionada = await tableDespesas.create(novaDespesa)
      return res.status(201).send(despesaAdicionada)
    } catch (error) {
      return next(error)
    }
  }

  static async deletarDespesa(req, res, next) {
    const { id } = req.params
    try {
      const itemDeletado = await tableDespesas.destroy({ where: { id: id } })
      if (itemDeletado) {
        return res.status(204).end()
      }
      throw new NenhumItemEncontrado()
    } catch (error) {
      return next(error)
    }
  }

  static async atualizarDespesa(req, res, next) {
    const { id } = req.params
    const novosCampos = req.body
    const atributosNovoObjeto = Object.keys(novosCampos)
    const camposAtualizar = ["descricao", "valor", "data"]
    try {
      atributosNovoObjeto.forEach((campo) => {
        if (camposAtualizar.indexOf(campo) === -1) {
          throw new CampoInvalido(campo)
        }
      })
      const resultadoAtualizacao = await tableDespesas.update(novosCampos, {
        where: { id: id },
      })
      if (resultadoAtualizacao) {
        return res.status(204).end()
      }
      throw new NenhumItemEncontrado()
    } catch (error) {
      return next(error)
    }
  }

  static async listaMes(req, res, next) {
    const { ano, mes } = req.params
    const despesasMesAno = []
    try {
      const camposBusca = ["id", "descricao", "valor", "data", "categoria"]
      const despesas = await tableDespesas.findAll({ attributes: camposBusca })
      if (!despesas) {
        throw new NenhumItemEncontrado()
      }
      despesas.forEach((despesa) => {
        console.log(despesa.data)
        const mesDespesa = new Date(despesa.data).getMonth() + 1
        const anoDespesa = new Date(despesa.data).getFullYear()
        console.log(mesDespesa, anoDespesa)
        if (mesDespesa === Number(mes) && anoDespesa === Number(ano)) {
          despesasMesAno.push(despesa)
        }
      })

      return res.status(200).json(despesasMesAno)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = DespesasController
