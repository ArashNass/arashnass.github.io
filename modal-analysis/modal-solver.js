(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.ModalSolver=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function dot(a,b){return a.reduce((sum,value,i)=>sum+value*b[i],0);}
  function norm(a){return Math.sqrt(dot(a,a));}
  function matVec(A,x){return A.map(row=>dot(row,x));}
  function frobenius(A){return Math.sqrt(A.reduce((s,row)=>s+dot(row,row),0));}

  function jacobiEigenSymmetric(Ain,n,maxSweeps=200,tol=1e-12){
    const a=Ain.map(row=>row.slice());
    const V=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
    let converged=n<2,sweeps=0,relativeOffDiagonal=0;
    for(let sweep=0;sweep<maxSweeps;sweep++){
      sweeps=sweep+1;
      let off2=0,diag2=0;
      for(let i=0;i<n;i++){
        diag2+=a[i][i]*a[i][i];
        for(let j=i+1;j<n;j++)off2+=2*a[i][j]*a[i][j];
      }
      relativeOffDiagonal=Math.sqrt(off2)/Math.max(Math.sqrt(diag2),Number.MIN_VALUE);
      if(relativeOffDiagonal<=tol){converged=true;break;}
      for(let p=0;p<n-1;p++)for(let q=p+1;q<n;q++){
        if(Math.abs(a[p][q])<=Number.EPSILON*Math.sqrt(Math.abs(a[p][p]*a[q][q])))continue;
        const theta=(a[q][q]-a[p][p])/(2*a[p][q]);
        const t=(theta>=0?1:-1)/(Math.abs(theta)+Math.sqrt(theta*theta+1));
        const c=1/Math.sqrt(t*t+1),s=t*c,tau=s/(1+c),apq=a[p][q];
        a[p][p]-=t*apq;a[q][q]+=t*apq;a[p][q]=0;a[q][p]=0;
        for(let k=0;k<n;k++)if(k!==p&&k!==q){
          const akp=a[k][p],akq=a[k][q];
          a[k][p]=akp-s*(akq+tau*akp);a[p][k]=a[k][p];
          a[k][q]=akq+s*(akp-tau*akq);a[q][k]=a[k][q];
        }
        for(let k=0;k<n;k++){
          const vkp=V[k][p],vkq=V[k][q];
          V[k][p]=vkp-s*(vkq+tau*vkp);V[k][q]=vkq+s*(vkp-tau*vkq);
        }
      }
    }
    return{
      eigenvalues:a.map((row,i)=>row[i]),
      eigenvectors:Array.from({length:n},(_,j)=>V.map(row=>row[j])),
      converged,sweeps,relativeOffDiagonal
    };
  }

  function buildStiffness(stiffnesses){
    const n=stiffnesses.length;
    const K=Array.from({length:n},()=>new Array(n).fill(0));
    for(let i=0;i<n;i++)K[i][i]=stiffnesses[i]+(i+1<n?stiffnesses[i+1]:0);
    for(let i=0;i<n-1;i++)K[i][i+1]=K[i+1][i]=-stiffnesses[i+1];
    return K;
  }

  function solveModes(masses,stiffnesses,options={}){
    if(!masses.length||masses.length!==stiffnesses.length)throw new Error('Mass and stiffness arrays must have the same non-zero length.');
    if(masses.some(v=>!Number.isFinite(v)||v<=0)||stiffnesses.some(v=>!Number.isFinite(v)||v<=0))throw new Error('Masses and stiffnesses must be finite and positive.');
    const n=masses.length,K=buildStiffness(stiffnesses),sqrtInv=masses.map(m=>1/Math.sqrt(m));
    const A=K.map((row,i)=>row.map((value,j)=>value*sqrtInv[i]*sqrtInv[j]));
    const eig=jacobiEigenSymmetric(A,n,options.maxSweeps||200,options.tolerance||1e-12);
    let raw=eig.eigenvalues.map((w2,idx)=>({w2,phi:eig.eigenvectors[idx].map((yi,i)=>yi*sqrtInv[i])}));
    raw.sort((a,b)=>a.w2-b.w2);
    raw=raw.filter(mode=>mode.w2>1e-12);
    const totalMass=masses.reduce((s,m)=>s+m,0),kNorm=frobenius(K),mNorm=Math.sqrt(dot(masses,masses));
    const modes=raw.map(mode=>{
      let phi=mode.phi.slice();if(phi[phi.length-1]<0)phi=phi.map(v=>-v);
      const omega=Math.sqrt(mode.w2),T=2*Math.PI/omega,L=dot(phi,masses),effMass=L*L;
      const residual=matVec(K,phi).map((v,i)=>v-mode.w2*masses[i]*phi[i]);
      const residualRelative=norm(residual)/(norm(phi)*(kNorm+Math.abs(mode.w2)*mNorm));
      const maxAbs=Math.max(...phi.map(Math.abs));
      return{w2:mode.w2,T,f:1/T,omega,phi,phiNorm:phi.map(v=>v/maxAbs),L,effMass,effMassPct:effMass/totalMass*100,residualRelative};
    });
    let maxMassOffDiagonal=0,maxStiffnessOffDiagonal=0,maxMassDiagonalError=0,maxStiffnessDiagonalError=0;
    for(let i=0;i<modes.length;i++)for(let j=0;j<modes.length;j++){
      const massProduct=modes[i].phi.reduce((s,v,k)=>s+v*masses[k]*modes[j].phi[k],0);
      const stiffnessProduct=dot(modes[i].phi,matVec(K,modes[j].phi));
      if(i===j){
        maxMassDiagonalError=Math.max(maxMassDiagonalError,Math.abs(massProduct-1));
        maxStiffnessDiagonalError=Math.max(maxStiffnessDiagonalError,Math.abs(stiffnessProduct-modes[i].w2)/Math.max(Math.abs(modes[i].w2),Number.MIN_VALUE));
      }else{
        maxMassOffDiagonal=Math.max(maxMassOffDiagonal,Math.abs(massProduct));
        maxStiffnessOffDiagonal=Math.max(maxStiffnessOffDiagonal,Math.abs(stiffnessProduct)/Math.sqrt(modes[i].w2*modes[j].w2));
      }
    }
    const effectiveMassTotalPct=modes.reduce((s,m)=>s+m.effMassPct,0);
    const diagnostics={converged:eig.converged,sweeps:eig.sweeps,relativeOffDiagonal:eig.relativeOffDiagonal,
      maxEigenResidual:Math.max(0,...modes.map(m=>m.residualRelative)),maxMassOffDiagonal,maxStiffnessOffDiagonal,
      maxMassDiagonalError,maxStiffnessDiagonalError,effectiveMassTotalPct,warnings:[]};
    if(!diagnostics.converged)diagnostics.warnings.push(`Eigenvalue solver did not converge after ${diagnostics.sweeps} sweeps.`);
    if(diagnostics.maxEigenResidual>1e-9)diagnostics.warnings.push(`Large eigenvalue residual (${diagnostics.maxEigenResidual.toExponential(2)}).`);
    if(Math.max(maxMassOffDiagonal,maxMassDiagonalError)>1e-9)diagnostics.warnings.push('Mass orthogonality check failed.');
    if(Math.max(maxStiffnessOffDiagonal,maxStiffnessDiagonalError)>1e-9)diagnostics.warnings.push('Stiffness orthogonality check failed.');
    if(Math.abs(effectiveMassTotalPct-100)>1e-6)diagnostics.warnings.push(`Effective modal mass totals ${effectiveMassTotalPct.toFixed(6)}%, expected approximately 100%.`);
    return{modes,diagnostics,K};
  }

  return{buildStiffness,jacobiEigenSymmetric,solveModes};
});
