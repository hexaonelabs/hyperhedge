import html2canvas from 'html2canvas';

export const generateSimpleShareImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    // Forcer le style de l'élément pour une capture propre
    const originalStyle = element.style.cssText;
    element.style.transform = 'scale(1)';
    element.style.transformOrigin = 'top left';
    
    // Attendre que le DOM soit stable
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Obtenir les dimensions réelles de l'élément
    const rect = element.getBoundingClientRect();
    const actualWidth = element.offsetWidth || rect.width;
    const actualHeight = element.offsetHeight || rect.height;
    
    // Options pour html2canvas - utiliser les dimensions réelles
    const canvas = await html2canvas(element, {
      backgroundColor: '#1a1a1a',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: actualWidth,
      height: actualHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      removeContainer: true
    });
    
    // Restaurer le style original
    element.style.cssText = originalStyle;
    
    // Convertir en data URL avec qualité maximale
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    return dataUrl;
  } catch (error) {
    console.error('Erreur génération image:', error);
    return null;
  }
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};