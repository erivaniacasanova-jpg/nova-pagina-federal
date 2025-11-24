"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import PaymentModal from "@/components/payment-modal"
import ErrorModal from "@/components/error-modal"
import SuccessModal from "@/components/success-modal"
import ProcessingModal from "@/components/processing-modal"
import { validateCPF } from "@/lib/cpf-validator"

interface RegistrationFormProps {
  representante?: {
    id: string
    nome: string
    whatsapp: string
  }
}

export default function RegistrationForm({ representante }: RegistrationFormProps = {}) {
  const [formData, setFormData] = useState({
    cpf: "",
    birth: "",
    name: "",
    email: "",
    phone: "",
    cell: "",
    cep: "",
    district: "",
    city: "",
    state: "",
    street: "",
    number: "",
    complement: "",
    typeChip: "fisico",
    plan_id: "",
    typeFrete: "",
    status: "0",
    father: representante?.id || "110956",
    type: "Recorrente"
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [billingId, setBillingId] = useState<string>("")
  const [errorModal, setErrorModal] = useState({ open: false, message: "" })
  const [cpfValid, setCpfValid] = useState<boolean | null>(null)

  const plans = [
    { id: "178", name: "VIVO - 40GB COM LIGACAO 49.90", category: "VIVO" },
    { id: "69", name: "VIVO - 80GB COM LIGACAO 69.90", category: "VIVO" },
    { id: "61", name: "VIVO - 150GB COM LIGACAO 99.90", category: "VIVO" },
    { id: "56", name: "TIM - 100GB COM LIGACAO 69.90", category: "TIM" },
    { id: "154", name: "TIM - 200GB SEM LIGAÇÃO 159.90", category: "TIM" },
    { id: "155", name: "TIM - 300GB SEM LIGAÇÃO 199.90", category: "TIM" },
    { id: "57", name: "CLARO - 80GB COM LIGACAO 69.90", category: "CLARO" },
    { id: "183", name: "CLARO - 150GB COM LIGACAO 99.90", category: "CLARO" }
  ]

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const maskCellPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1")
  }

  const maskDate = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+?$/, "$1")
  }

  const convertDateToISO = (dateStr: string) => {
    const cleanDate = dateStr.replace(/\D/g, "")
    if (cleanDate.length === 8) {
      const day = cleanDate.substring(0, 2)
      const month = cleanDate.substring(2, 4)
      const year = cleanDate.substring(4, 8)
      return `${year}-${month}-${day}`
    }
    return ""
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    let maskedValue = value

    if (name === "cpf") {
      maskedValue = maskCPF(value)
      if (maskedValue.length === 14) {
        setCpfValid(validateCPF(maskedValue))
      } else {
        setCpfValid(null)
      }
    }
    if (name === "phone") maskedValue = maskPhone(value)
    if (name === "cell") maskedValue = maskCellPhone(value)
    if (name === "cep") maskedValue = maskCEP(value)

    setFormData(prev => ({ ...prev, [name]: maskedValue }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "")

    if (cep.length !== 8) {
      return
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || "",
          district: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          complement: data.complemento || ""
        }))
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCPF(formData.cpf)) {
      setErrorModal({
        open: true,
        message: "CPF inválido. Por favor, verifique o número digitado."
      })
      return
    }

    if (!formData.plan_id) {
      setErrorModal({
        open: true,
        message: "Por favor, selecione um plano antes de continuar."
      })
      return
    }

    if (!formData.typeFrete) {
      setErrorModal({
        open: true,
        message: "Por favor, selecione uma forma de envio."
      })
      return
    }

    setIsLoading(true)

    console.log("[Frontend] ==================== ENVIANDO CADASTRO ====================")
    console.log("[Frontend] User Agent:", navigator.userAgent)
    console.log("[Frontend] Plataforma:", navigator.platform)
    console.log("[Frontend] Dados do formulário:", JSON.stringify(formData, null, 2))

    try {
      console.log("[Frontend] 🎯 ENVIANDO VIA IFRAME (SEM CORS!)")

      const cleanCPF = (formData.cpf || "").replace(/[^\d]/g, "")
      const cleanPhone = (formData.phone || "").replace(/[^\d]/g, "")
      const cleanCell = (formData.cell || "").replace(/[^\d]/g, "")
      const cleanCEP = (formData.cep || "").replace(/[^\d]/g, "")

      const iframe = document.createElement("iframe")
      iframe.name = "federal_form_target"
      iframe.style.display = "none"
      document.body.appendChild(iframe)

      // Converter plan_id e typeFrete SOMENTE para o webhook (empresa recebe o ID)
      const selectedPlan = plans.find(p => p.id === formData.plan_id)
      let planName = formData.plan_id
      if (selectedPlan) {
        // Remove apenas o preço, mantém operadora e plano (ex: "VIVO - 40GB COM LIGACAO 49.90" -> "VIVO - 40GB COM LIGACAO")
        planName = selectedPlan.name.replace(/\s+[\d.]+$/, '')
      }

      const freteMap: { [key: string]: string } = {
        "Carta": "Enviar via Carta Registrada",
        "semFrete": "Retirar na Associação",
        "eSim": "e-SIM"
      }
      const freteName = freteMap[formData.typeFrete] || formData.typeFrete

      const form = document.createElement("form")
      form.method = "POST"
      form.action = "https://federalassociados.com.br/registroSave"
      form.target = "federal_form_target"
      form.style.display = "none"

      const fields = {
        "_token": "oCqwAglu4VySDRcwWNqj81UMfbKHCS2vWQfARkzu",
        "status": formData.status || "0",
        "father": formData.father || "110956",
        "type": formData.type || "Recorrente",
        "cpf": cleanCPF,
        "birth": formData.birth || "",
        "name": formData.name || "",
        "email": formData.email || "",
        "phone": cleanPhone,
        "cell": cleanCell,
        "cep": cleanCEP,
        "district": formData.district || "",
        "city": formData.city || "",
        "state": formData.state || "",
        "street": formData.street || "",
        "number": formData.number || "",
        "complement": formData.complement || "",
        "typeChip": formData.typeChip || "fisico",
        "coupon": formData.coupon || "",
        "plan_id": formData.plan_id || "",
        "typeFrete": formData.typeFrete || ""
      }

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = value
        form.appendChild(input)
      }

      document.body.appendChild(form)
      console.log("[Frontend] Formulário criado, enviando...")
      console.log("[Frontend] 📤 ACTION:", form.action)
      console.log("[Frontend] 📤 METHOD:", form.method)
      console.log("[Frontend] 📤 TARGET:", form.target)
      console.log("[Frontend] 📤 CAMPOS:", Object.keys(fields).length, "campos")

      form.submit()

      let checkCount = 0
      const maxChecks = 10
      const checkInterval = setInterval(() => {
        checkCount++
        console.log(`[Frontend] ⚡ Check ${checkCount}/${maxChecks}`)

        try {
          const iframeLocation = iframe.contentWindow?.location.href
          console.log("[Frontend] iframe:", iframeLocation)

          if (iframeLocation && iframeLocation !== "about:blank") {
            const patterns = [
              /registroFinish\/(\d+)/,
              /boletos\/(\d+)/,
              /billing[_\/](\d+)/,
              /id[_\/=](\d+)/,
            ]

            let billing_id = null
            for (const pattern of patterns) {
              const match = iframeLocation.match(pattern)
              if (match && match[1]) {
                billing_id = match[1]
                console.log("[Frontend] ✅ ID:", billing_id)
                break
              }
            }

            if (billing_id) {
              clearInterval(checkInterval)
              document.body.removeChild(form)
              document.body.removeChild(iframe)

              // Enviar para webhook com os nomes convertidos
              console.log("[Frontend] Enviando dados para webhook...")

              const webhookData = {
                billing_id,
                cpf: formData.cpf,
                birth: formData.birth,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                cell: formData.cell,
                cep: formData.cep,
                district: formData.district,
                city: formData.city,
                state: formData.state,
                street: formData.street,
                number: formData.number,
                complement: formData.complement,
                tipo_chip: formData.typeChip === "fisico" ? "Físico" : "e-SIM",
                plano: planName,
                forma_envio: freteName,
                status: formData.status,
                father: formData.father,
                type: formData.type
              }

              fetch("https://webhook.fiqon.app/webhook/a0265c1b-d832-483e-af57-8096334a57a8/e167dea4-079e-4af4-9b3f-4acaf711f432", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhookData)
              }).then(() => {
                console.log("[Frontend] ✅ Dados enviados para webhook", webhookData)
              }).catch(err => {
                console.error("[Frontend] ⚠️ Erro ao enviar para webhook:", err)
              })

              setIsLoading(false)
              setBillingId(billing_id)
              setShowProcessingModal(true)
              return
            }
          }
        } catch (e) {
          // CORS esperado
        }

        if (checkCount >= maxChecks) {
          clearInterval(checkInterval)
          console.log("[Frontend] ✅ Assumindo sucesso")
          document.body.removeChild(form)
          document.body.removeChild(iframe)

          // Enviar para webhook APÓS sucesso (assumindo billing_id genérico)
          console.log("[Frontend] Enviando dados para webhook...")
          fetch("https://webhook.fiqon.app/webhook/a0265c1b-d832-483e-af57-8096334a57a8/e167dea4-079e-4af4-9b3f-4acaf711f432", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              billing_id: "pending",
              ...formData
            })
          }).then(() => {
            console.log("[Frontend] ✅ Dados enviados para webhook")
          }).catch(err => {
            console.error("[Frontend] ⚠️ Erro ao enviar para webhook:", err)
          })

          setIsLoading(false)
          setShowProcessingModal(true)
        }
      }, 300)

    } catch (error) {
      console.error("[Frontend] ERRO CRÍTICO no envio:", error)
      setIsLoading(false)
      setErrorModal({
        open: true,
        message: "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente."
      })
    }
  }

  useEffect(() => {
    if (formData.typeChip === "eSim") {
      setFormData(prev => ({ ...prev, typeFrete: "eSim" }))
    }
  }, [formData.typeChip])

  return (
    <>
      <div className="container mx-auto px-6 py-8 max-w-md md:max-w-5xl">
        <Card>
          <CardContent className="pt-8 md:pt-8 px-6 md:px-10">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
              <input type="hidden" name="status" value="0" />
              <input type="hidden" name="father" value={formData.father} />
              <input type="hidden" name="type" value="Recorrente" />

              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b-2 border-gray-200 pb-3">Dados Pessoais</h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="cpf">CPF <span className="text-red-600">*</span></Label>
                  <div className="relative">
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      required
                      className={
                        cpfValid === true
                          ? "border-green-500 focus-visible:border-green-500"
                          : cpfValid === false
                          ? "border-red-500 focus-visible:border-red-500"
                          : ""
                      }
                    />
                    {cpfValid === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                    )}
                    {cpfValid === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">✗</span>
                    )}
                  </div>
                  {cpfValid === false && (
                    <p className="text-xs text-red-500 mt-1">CPF inválido</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="birth">Data de nascimento <span className="text-red-600">*</span></Label>
                  <Input
                    id="birth"
                    name="birth"
                    type="text"
                    value={formData.birth ? (formData.birth.includes('-') ? formData.birth.split('-').reverse().join('/') : formData.birth) : ''}
                    onChange={(e) => {
                      const masked = maskDate(e.target.value)
                      const isoDate = convertDateToISO(masked)
                      setFormData(prev => ({ ...prev, birth: isoDate || masked }))
                    }}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="md:col-span-6">
                  <Label htmlFor="name">Nome Completo <span className="text-red-600">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                <div className="md:col-span-9">
                  <Label htmlFor="email">Email <span className="text-red-600">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="cell">WhatsApp <span className="text-red-600">*</span></Label>
                  <Input
                    id="cell"
                    name="cell"
                    value={formData.cell}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b-2 border-gray-200 pb-3">Endereço</h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="cep">CEP <span className="text-red-600">*</span></Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="district">Bairro <span className="text-red-600">*</span></Label>
                  <Input
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="city">Cidade <span className="text-red-600">*</span></Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="state">Estado <span className="text-red-600">*</span></Label>
                  <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                      <SelectItem value="EX">Estrangeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                <div className="md:col-span-9">
                  <Label htmlFor="street">Endereço <span className="text-red-600">*</span></Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4">
                <div className="md:col-span-12">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b-2 border-gray-200 pb-3 mb-6">Escolha do Plano</h3>

                <div>
                  <Label htmlFor="typeChip">Tipo de Chip</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectChange("typeChip", "fisico")}
                      className={`flex-1 py-2 px-3 rounded-md border transition-all text-sm ${
                        formData.typeChip === "fisico"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      Físico
                    </button>
                    <span className="text-muted-foreground text-sm px-1">ou</span>
                    <button
                      type="button"
                      onClick={() => handleSelectChange("typeChip", "eSim")}
                      className={`flex-1 py-2 px-3 rounded-md border transition-all text-sm ${
                        formData.typeChip === "eSim"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      e-SIM
                    </button>
                  </div>
                </div>

                <div style={{display: "none"}}>
                  <Select value={formData.typeChip} onValueChange={(value) => handleSelectChange("typeChip", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisico">Físico</SelectItem>
                      <SelectItem value="eSim">e-SIM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                <Label htmlFor="plan_id">Escolha seu benefício para se associar.</Label>
                <Select value={formData.plan_id} onValueChange={(value) => handleSelectChange("plan_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold text-purple-600">VIVO</div>
                    {plans.filter(p => p.category === "VIVO").map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-blue-600">TIM</div>
                    {plans.filter(p => p.category === "TIM").map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-red-600">CLARO</div>
                    {plans.filter(p => p.category === "CLARO").map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>

              <div className="mt-8">
                <Label className="text-base font-semibold mb-4 block">Escolha a forma de envio</Label>
                <RadioGroup value={formData.typeFrete} onValueChange={(value) => handleSelectChange("typeFrete", value)} className="mt-4">
                  {formData.typeChip !== "eSim" && (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Carta" id="carta" />
                          <Label htmlFor="carta">Enviar via Carta Registrada</Label>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">Essa opção é para quem vai receber o chip pelos correios.</p>
                      </div>
                      <div className="space-y-1 mt-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="semFrete" id="semFrete" />
                          <Label htmlFor="semFrete">Retirar na Associação ou com um Associado</Label>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">Aqui é para quem vai retirar o chip pessoalmente com o seu patrocinador. Ou, no caso dos planos da Vivo, comprar um (chip lacrado sem créditos) para solicitar a ativação de forma imediata.</p>
                      </div>
                    </>
                  )}
                  {formData.typeChip === "eSim" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eSim" id="eSim" checked />
                      <Label htmlFor="eSim">Sem a necessidade de envio (e-SIM)</Label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="destructive" onClick={() => window.history.back()}>
                  Voltar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <SuccessModal
        open={showSuccessModal}
        onContinue={() => {
          window.location.href = "https://federalassociados.com.br/boletos"
        }}
      />

      {showPaymentModal && <PaymentModal billingId={billingId} />}
      <ProcessingModal open={showProcessingModal} />
      <ErrorModal
        open={errorModal.open}
        message={errorModal.message}
        onOpenChange={(open) => {
          if (!open) {
            setErrorModal({ open: false, message: "" })
          }
        }}
      />
    </>
  )
}
