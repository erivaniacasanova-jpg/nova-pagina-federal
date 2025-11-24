import { type NextRequest, NextResponse } from "next/server"

// CORS headers para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Função para enviar dados ao webhook
async function sendToWebhook(formData: any, billingId: string) {
  const webhookUrl = "https://webhook.fiqon.app/webhook/a0265c1b-d832-483e-af57-8096334a57a8/e167dea4-079e-4af4-9b3f-4acaf711f432"

  console.log("[Webhook] ==================== INICIANDO ENVIO PARA WEBHOOK ====================")
  console.log("[Webhook] URL:", webhookUrl)
  console.log("[Webhook] billing_id:", billingId)
  console.log("[Webhook] Dados completos:", JSON.stringify(formData, null, 2))

  const webhookData = {
    billing_id: billingId,
    ...formData
  }

  console.log("[Webhook] Payload final:", JSON.stringify(webhookData, null, 2))

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    console.log("[Webhook] Response status:", response.status)
    console.log("[Webhook] Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[Webhook] Response body:", responseText)

    if (!response.ok) {
      console.error("[Webhook] ERRO - Status não OK:", response.status, response.statusText)
      throw new Error(`Webhook failed: ${response.status} - ${responseText}`)
    }

    console.log("[Webhook] ✅ SUCESSO - Dados enviados com sucesso para webhook")
  } catch (error) {
    console.error("[Webhook] ==================== ERRO CRÍTICO NO WEBHOOK ====================")
    console.error("[Webhook] Erro:", error)
    throw error
  }
}

// Handle OPTIONS request (preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[Federal API] ==================== INÍCIO DO CADASTRO ====================")
    console.log("[Federal API] Ambiente:", process.env.NODE_ENV)
    console.log("[Federal API] Vercel:", process.env.VERCEL)
    console.log("[Federal API] Dados recebidos do frontend:", JSON.stringify(body, null, 2))

    // Remove formatação de CPF, telefones e CEP
    const cleanCPF = (body.cpf || "").replace(/[^\d]/g, "")
    const cleanPhone = (body.phone || "").replace(/[^\d]/g, "")
    const cleanCell = (body.cell || "").replace(/[^\d]/g, "")
    const cleanCEP = (body.cep || "").replace(/[^\d]/g, "")

    const formData = new URLSearchParams()
    formData.append("_token", "oCqwAglu4VySDRcwWNqj81UMfbKHCS2vWQfARkzu")
    formData.append("status", body.status || "0")
    formData.append("father", body.father || "110956")
    formData.append("type", body.type || "Recorrente")
    formData.append("cpf", cleanCPF)
    formData.append("birth", body.birth || "")
    formData.append("name", body.name || "")
    formData.append("email", body.email || "")
    formData.append("phone", cleanPhone)
    formData.append("cell", cleanCell)
    formData.append("cep", cleanCEP)
    formData.append("district", body.district || "")
    formData.append("city", body.city || "")
    formData.append("state", body.state || "")
    formData.append("street", body.street || "")
    formData.append("number", body.number || "")
    formData.append("complement", body.complement || "")
    formData.append("typeChip", body.typeChip || "fisico")
    formData.append("coupon", body.coupon || "")
    formData.append("plan_id", body.plan_id || "")
    formData.append("typeFrete", body.typeFrete || "")

    console.log("[Federal API] Dados que serão enviados para Federal Associados:")
    console.log("[Federal API] URL:", "https://federalassociados.com.br/registroSave")
    console.log("[Federal API] FormData:", formData.toString())

    // Headers para passar pelo Cloudflare
    const response = await fetch("https://federalassociados.com.br/registroSave", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://federalassociados.com.br",
        "Referer": "https://federalassociados.com.br/registro/110956",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      body: formData.toString(),
      redirect: "manual", // Don't follow redirects automatically
    })

    const contentType = response.headers.get("content-type")
    console.log("[Federal] Response status:", response.status)
    console.log("[Federal] Content-Type:", contentType)
    console.log("[Federal] ALL HEADERS:", Object.fromEntries(response.headers.entries()))

    // Check for redirect FIRST (302, 301, or even 303, 307, 308)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location")
      console.log("[Federal] Redirect location:", location)

      if (location) {
        // Try multiple patterns for redirect URL
        const patterns = [
          /registroFinish\/(\d+)/,
          /boletos\/(\d+)/,
          /billing[_\/](\d+)/,
          /id[_\/=](\d+)/,
        ]

        for (const pattern of patterns) {
          const match = location.match(pattern)
          if (match && match[1]) {
            const billing_id = match[1]
            console.log("[Federal] SUCCESS - Billing ID from redirect:", billing_id)

            // Enviar para webhook APÓS sucesso
            try {
              await sendToWebhook(body, billing_id)
            } catch (webhookError) {
              console.error("[Webhook] Erro ao enviar para webhook:", webhookError)
              // Não falha o cadastro se webhook falhar
            }

            return NextResponse.json({
              success: true,
              billing_id,
              message: "Cadastro realizado com sucesso",
            }, { headers: corsHeaders })
          }
        }
      }

      console.error("[Federal] AVISO - Redirect sem billing_id no location:", location)
      // Don't fail here, continue to check response body
    }

    if (!response.ok) {
      console.error("[Federal] ERRO - Status não OK:", response.status)
      console.error("[Federal] Status Text:", response.statusText)

      if (contentType?.includes("application/json")) {
        const data = await response.json()
        console.error("[Federal] Erro JSON:", JSON.stringify(data, null, 2))

        let errorMessage = data.message || "Erro ao processar cadastro"

        if (data.errors) {
          const errorsList = Object.entries(data.errors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = {
                'cpf': 'CPF',
                'email': 'E-mail',
                'phone': 'Telefone',
                'cell': 'Celular',
                'name': 'Nome',
                'birth': 'Data de nascimento',
                'cep': 'CEP',
                'plan_id': 'Plano'
              }[field] || field

              return `${fieldName}: ${Array.isArray(messages) ? messages[0] : messages}`
            })
            .join('\n')

          errorMessage = errorsList || errorMessage
        }

        return NextResponse.json(
          {
            message: errorMessage,
            errors: data.errors || {},
          },
          { status: response.status, headers: corsHeaders },
        )
      }

      const text = await response.text()
      console.error("[Federal] ==================== ERRO 403 DETALHADO ====================")
      console.error("[Federal] Status:", response.status)
      console.error("[Federal] Content-Type:", contentType)
      console.error("[Federal] Resposta HTML completa (primeiros 2000 chars):")
      console.error(text.substring(0, 2000))
      console.error("[Federal] ==================== FIM DO ERRO ====================")

      return NextResponse.json(
        {
          message: "Erro ao processar cadastro na empresa",
          statusCode: response.status,
          statusText: response.statusText,
          errorDetails: text.substring(0, 500)
        },
        { status: response.status, headers: corsHeaders }
      )
    }

    // Se chegou aqui, status é 200 (sucesso)
    if (contentType?.includes("application/json")) {
      const data = await response.json()
      console.log("[Federal] JSON Response:", data)

      const billing_id = data.billing_id || data.id || data.associado_id || data.registro_id

      if (billing_id) {
        // Enviar para webhook APÓS sucesso
        try {
          await sendToWebhook(body, billing_id)
        } catch (webhookError) {
          console.error("[Webhook] Erro ao enviar para webhook:", webhookError)
          // Não falha o cadastro se webhook falhar
        }

        return NextResponse.json({
          success: true,
          billing_id,
          message: "Cadastro realizado com sucesso",
        }, { headers: corsHeaders })
      }

      console.error("[Federal] JSON sem billing_id:", data)
      // Continue to try HTML parsing
    }

    // Try HTML response
    {
      const text = await response.text()
      console.log("[Federal] HTML Response (primeiros 2000 chars):", text.substring(0, 2000))
      console.log("[Federal] HTML Response (últimos 1000 chars):", text.substring(text.length - 1000))

      // Tentar vários padrões para encontrar o billing_id
      const patterns = [
        /registroFinish\/(\d+)/i,
        /billing[_-]?id["\s:=]+(\d+)/i,
        /boletos\/(\d+)/i,
        /"id":\s*(\d+)/i,
        /'id':\s*(\d+)/i,
        /associado[_-]?id["\s:=]+(\d+)/i,
        /cadastro[_-]?id["\s:=]+(\d+)/i,
        /registro[_-]?id["\s:=]+(\d+)/i,
        /window\.location\s*=\s*['"].*?\/(\d+)/i,
        /href\s*=\s*['"].*?registroFinish\/(\d+)/i,
        /href\s*=\s*['"].*?boletos\/(\d+)/i,
      ]

      let billing_id = null
      let matchedPattern = null

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          billing_id = match[1]
          matchedPattern = pattern.toString()
          break
        }
      }

      if (billing_id) {
        console.log("[Federal] SUCCESS - Billing ID encontrado:", billing_id)
        console.log("[Federal] Pattern usado:", matchedPattern)

        // Enviar para webhook APÓS sucesso
        try {
          await sendToWebhook(body, billing_id)
        } catch (webhookError) {
          console.error("[Webhook] Erro ao enviar para webhook:", webhookError)
          // Não falha o cadastro se webhook falhar
        }

        return NextResponse.json({
          success: true,
          billing_id,
          message: "Cadastro realizado com sucesso",
        }, { headers: corsHeaders })
      }

      console.error("[Federal] ERRO CRÍTICO - Nenhum billing_id encontrado!")
      console.error("[Federal] HTML completo:", text)
      return NextResponse.json(
        { message: "Erro: Cadastro não retornou ID de confirmação" },
        { status: 500, headers: corsHeaders }
      )
    }
  } catch (error) {
    console.error("[Federal API] ==================== ERRO CRÍTICO ====================")
    console.error("[Federal API] Tipo do erro:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[Federal API] Mensagem:", error instanceof Error ? error.message : String(error))
    console.error("[Federal API] Stack:", error instanceof Error ? error.stack : "N/A")

    return NextResponse.json({
      message: "Erro ao processar cadastro na empresa",
      error: error instanceof Error ? error.message : String(error),
      details: "Verifique os logs do servidor para mais informações"
    }, { status: 500, headers: corsHeaders })
  }
}
