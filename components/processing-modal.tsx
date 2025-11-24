"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProcessingModalProps {
  open: boolean
}

export default function ProcessingModal({ open }: ProcessingModalProps) {
  const handleContinue = () => {
    window.location.href = "https://federalassociados.com.br/boletos"
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold">
              Parabéns! Seu cadastro foi realizado com sucesso. 🎉
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
            <p>
              Para darmos continuidade com à ativação do seu plano, é necessário realizar o pagamento da sua taxa associativa, no valor proporcional ao plano escolhido por você.
            </p>

            <p>
              Essa taxa é solicitada antes da ativação, pois ela confirma oficialmente a sua entrada na Federal Associados.
            </p>

            <p className="font-semibold">
              O valor é usado para cobrir os custos administrativos e operacionais, como:
            </p>

            <ul className="list-disc list-inside space-y-1 pl-2 text-sm sm:text-base">
              <li>Geração do número.</li>
              <li>Configuração da linha.</li>
              <li>Liberação do seu escritório virtual.</li>
              <li>E acesso a todos os benefícios exclusivos da empresa, como o Clube de Descontos, Cinema Grátis, Programa PBI, entre outros.</li>
            </ul>

            <p>
              O pagamento da taxa é o primeiro passo para liberar o seu benefício de internet móvel e garantir sua ativação com total segurança.
            </p>

            <p>
              Logo após efetuar o pagamento, você receberá um e-mail para fazer a biometria digital.
            </p>

            <p>
              Após isso já partimos para ativação do seu plano.
            </p>

            <p className="text-center font-semibold text-base sm:text-lg mt-3">
              Clique no botão abaixo para continuar:
            </p>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg py-5 sm:py-6 rounded-lg font-semibold"
          >
            Realizar Adesão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
