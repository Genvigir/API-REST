module.exports = (err, req, res, next) => {
    console.error(err.stack); // Log do erro para depuração
    const status = err.status || 500; // Status padrão é 500 se não especificado
    const message = err.message || "Erro interno no servidor";
    
    res.status(status).json({ 
      error: true,
      message 
    });
  };
  