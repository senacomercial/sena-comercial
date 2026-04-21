import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Bio from './components/Bio.jsx';
import FilterBlock from './components/FilterBlock.jsx';
import Footer from './components/Footer.jsx';
import { CTAButton, Overline, Highlight, SectionHeader } from './components/Primitives.jsx';
import { ProofStrip, MetricCard, PricingCard } from './components/Components.jsx';
import { asset } from './utils.js';

const proofItems = [
  { tag: 'Caso Anderson Gusmão', body: 'R$ 300 investidos → 11 visitas hiperqualificadas em 1 semana → R$ 1.000.000 em vendas fechadas.' },
  { tag: 'Corretora autônoma', body: 'R$ 200 de investimento → imóvel vendido em menos de 30 dias, sem agência.' },
  { tag: 'Dado validado', body: 'Lead que responde 3 perguntas de qualificação tem taxa de conversão 5× maior.' },
];

const mavisSteps = [
  { title: 'Atração com Fricção', body: 'anúncios que exigem clique consciente e afastam curiosos antes mesmo do contato.' },
  { title: 'Qualificação Síncrona', body: 'o "pedágio obrigatório" de 3 perguntas (Renda, Prazo, Localização) que filtra o lead antes de chegar no seu WhatsApp.' },
  { title: 'Fechamento por Encantamento', body: 'postura ativa de negociação para transformar visitas em contratos assinados.' },
];

export default function App() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <Bio />

      {/* MECHANISM */}
      <section id="mechanism" style={{ padding: '120px 32px', background: '#000', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'start' }}>
          <div>
            <SectionHeader
              over="MECANISMO ÚNICO · O PROBLEMA REAL"
              title={<>O corretor não tem falta de leads.<br />Tem <Highlight>excesso de Leads Inertes.</Highlight></>}
              lede="Agências são pagas para gerar o menor CPL possível. Removem as barreiras de entrada, atraem curiosos sem crédito e sem intenção — e o seu WhatsApp vira depósito de vácuo."
            />
            <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <MetricCard over="CPL sem filtro" num="R$ 14" sub="curioso entra a custo baixo" />
              <MetricCard over="horas/dia perdidas" num="4h+" sub="respondendo lead inerte" />
            </div>
          </div>
          <div style={{
            background: `url(${asset('brand-strategy-board.png')}) center/cover`,
            height: 440, borderRadius: 4, position: 'relative'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.1) 40%, rgba(0,0,0,.95))', borderRadius: 4 }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
              <Overline variant="orange">TELEMETRIA</Overline>
              <div style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontWeight: 700, fontSize: 24, lineHeight: 1.3, color: '#fff', marginTop: 10 }}>
                "Agência comemora o CPL baixo. O corretor perde o dia em vácuo."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section id="method" style={{ padding: '120px 32px', background: 'linear-gradient(180deg,#000,#0A0A0A)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader
            over="A SOLUÇÃO · MÁQUINA DE VENDAS IMOBILIÁRIAS DA SENA"
            title={<>A MaVIS instala um <Highlight color="gold">Filtro de Intencionalidade Pós-Clique</Highlight></>}
            lede="Três pilares. Plug-and-play. O WhatsApp do corretor só é desbloqueado para quem passa pelo filtro."
            align="center"
          />
          <div style={{ maxWidth: 720, margin: '56px auto 0' }}>
            <FilterBlock title="O Protocolo MaVIS" steps={mavisSteps} />
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" style={{ padding: '120px 32px', background: '#000' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <SectionHeader over="PROVAS · DA PISTA" title={<>Resultado cravado em dados.<br />Não em vaidade.</>} />
            <div style={{ marginTop: 36 }}><ProofStrip items={proofItems} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <MetricCard over="Vendas · 1 semana" num="R$ 1.0M" sub="com R$ 300 investidos" variant="gold" />
            <MetricCard over="Conversão" num="5×" sub="vs lead inerte" variant="gold" />
            <MetricCard over="Visitas qualificadas" num="11" sub="em 7 dias · Gusmão" />
            <MetricCard over="Tempo de fechamento" num="30d" sub="imóvel autônomo" variant="gold" />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '120px 32px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader
            over="MENTORIA · MODELOS DE ENTREGA"
            title="Três formatos. Uma máquina."
            lede="Escolha o nível de acompanhamento. Implementação é com a Sena — autogestão é com você, no fim do ciclo."
            align="center"
          />
          <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            <PricingCard
              over="Grupo · 6 meses"
              name="Mentoria em Grupo"
              price="R$ 6.500"
              pricePromo="R$ 4.950"
              includes={['Aulas ao vivo 1x/semana', 'Área de membros + gravações', 'Biblioteca de scripts', 'Grupo VIP no WhatsApp', '6 calls individuais']}
            />
            <PricingCard
              over="Estruturação Estratégica · intensivo"
              name="Estruturação Estratégica Diagnóstica"
              price="R$ 20.000"
              pricePromo="R$ 18.000"
              featured
              includes={['Auditoria 360° da operação', 'Mapeamento do funil e dos gargalos', 'Plano de ação cravado em KPI', 'Roadmap de implantação priorizado', 'Call de devolutiva com Airton']}
            />
            <PricingCard
              over="Implantação + individual"
              name="Implantação Completa"
              price="R$ 30.000"
              pricePromo="R$ 27.000"
              includes={['Diagnóstico 360° (meses 1-2)', 'Implantação total (3-4)', 'Autogestão (5-6)', 'CRM reestruturado + automações', 'Time treinado em speech e KPIs']}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{
        padding: '140px 32px',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.85), rgba(0,0,0,.95)), url(${asset('airton-portrait.png')})`,
        backgroundSize: 'cover', backgroundPosition: 'center 20%', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Overline variant="orange">AGENDE A SUA TELEMETRIA</Overline>
          <h2 style={{
            fontFamily: '"Playfair Display",serif', fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.1, letterSpacing: '-.02em',
            margin: '20px 0 22px', color: '#fff'
          }}>
            Estruture a sua máquina de vendas. <Highlight>Hoje.</Highlight>
          </h2>
          <p style={{ fontFamily: 'Montserrat,sans-serif', fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,.72)', margin: '0 auto 36px', maxWidth: 560 }}>
            Vamos te dizer exatamente o que precisa ser feito — sem desperdiçar um segundo do seu tempo.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <CTAButton size="lg" icon={<span>📲</span>}>Agendar diagnóstico</CTAButton>
            <CTAButton size="lg" variant="ghost">Ver cronograma completo</CTAButton>
          </div>
          <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 28, letterSpacing: '.1em' }}>
            SENA ACOMPANHA NO MÁXIMO 3 MENTORADOS POR CICLO
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
