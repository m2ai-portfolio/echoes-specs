# Generates the five InjectPreviewGesture segments (A-E) used for the take.
# Mapping: x_inject = 0.5 + (x_cam - 0.5) * 0.6863, y_inject = y_cam. Holds are inert 'X' key presses.
import json
TK,TT,GAP=0.22,0.157,3.4
P={'pillar':(0.2299,0.4563),'beam':(0.2299,0.5874),'pedestal':(0.2299,0.7185),'marker':(0.2299,0.8495),
 'left':(0.3569,0.8173),'right':(0.6431,0.8173),'beamseat':(0.5,0.7043),'pedseat':(0.5,0.6530),'markseat':(0.5,0.6093),
 'tr':(0.7701,0.7395),'confirm':(0.7701,0.8621),'help':(0.2299,0.1925),'pause':(0.2299,0.3067),
 'undo':(0.7701,0.1925),'replay':(0.7701,0.3067),'floor':(0.06,0.95)}
def tap(n): x,y=P[n]; return [{"type":"touch","state":s,"x":x,"y":y} for s in ("start","move","end")]
def click(n): return tap(n)+tap(n)
def hold(s, f=1.3): s = s if s>=6 else s*f; return [{"type":"key","key":"X"}]*max(1,round(s/TK))
S={}
S['A']=hold(6.0)+click('pillar')+hold(1.0)+click('left')+hold(3.0)+click('confirm')+hold(3.0)+click('replay')+hold(0.5)  # +gap -> ~3.9 s
S['B']=click('pillar')+hold(0.5)+click('left')+hold(0.5)+click('confirm')+hold(2.0)+click('beam')+hold(0.8)+click('right')+hold(0.8)+click('confirm')+hold(3.0)+click('pillar')+hold(0.8)+click('confirm')+hold(0.3)
S['C']=click('help')+hold(5.0)+tap('help')+hold(1.5)+click('beam')+hold(1.2)+click('beamseat')+hold(0.8)+click('confirm')+hold(3.0)+click('tr')+hold(1.2)+click('confirm')+hold(0.3)
S['D']=click('pedestal')+hold(0.8)+click('pedseat')+hold(0.8)+click('pause')+hold(3.0)+click('confirm')+hold(1.0)+click('pause')+hold(2.0)+click('confirm')+hold(1.0)+click('undo')+hold(3.0)+click('pedestal')+hold(0.6)+click('pedseat')+hold(0.6)+click('confirm')+hold(0.3)
S['E']=click('marker')+hold(1.0)+click('tr')+hold(0.8)+tap('tr')+hold(1.0)+click('markseat')+hold(0.8)+click('confirm')+hold(3.5)+tap('floor')+hold(7.0)
tot=0
for k,v in S.items():
  nk=sum(1 for s in v if s['type']=='key'); nt=len(v)-nk; t=nk*TK+nt*TT; tot+=t
  open(f'T{k}.txt','w').write(json.dumps(v,separators=(',',':')))
  print(k,len(v),'steps est',round(t,1),'s')
print('performance+gaps est',round(tot+4*GAP,1),'s')
