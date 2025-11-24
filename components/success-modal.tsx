"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessModalProps {
  open: boolean
  onContinue: () => void
}

export default function SuccessModal({ open, onContinue }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        showCloseButton={false}
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" strokeWidth={2} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              Parabéns! Seu cadastro foi realizado com sucesso.
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
            <p>
              Para darmos continuidade com à ativação do seu plano, é necessário realizar o pagamento da sua taxa associativa, no valor proporcional ao plano escolhido por você.
            </p>

            <p>
              Essa taxa é solicitada antes da ativação, pois ela confirma oficialmente a sua entrada na Federal Associados.
            </p>

            <p className="font-semibold">
              O valor é usado para cobrir os custos administrativos e operacionais, como:
            </p>

            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
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

            <p className="font-semibold text-center text-base sm:text-lg mt-4 sm:mt-6">
              Clique no botão abaixo para continuar:
            </p>
          </div>

          <div className="pt-2 sm:pt-4">
            <Button
              onClick={onContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 sm:py-6 text-base sm:text-lg font-semibold"
            >
              Realizar Adesão
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
