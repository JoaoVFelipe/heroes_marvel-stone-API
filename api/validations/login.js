import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import Users from '../models/Users';
import FieldMessage from './fieldMessage';

module.exports = () => {
  const validations = {};

  // Function to check the password based on the saved hash
  const checkPassword = (password, user) => {
    return bcrypt.compare(password, user.password);
  }

  validations.login = async (req) => {
    const errors = [];
    const { email, password } = req.body;

    const schema = Yup.object().shape({
        email: Yup.string().required('Campo Obrigatório').email('Formato de e-mail inválido'),
        password: Yup.string().required('Campo Obrigatório').min(6, 'Senha deve ter no mínimo 6 caracteres'),
    });

    try {
        await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
        err.inner.forEach((error) => {
            errors.push(new FieldMessage(error.path, error.message));
        });
        return errors;
    }

    // Search for the email on database
    const existingUser = await Users.findOne({ where: { email } });
    if (!existingUser) {
      errors.push(new FieldMessage('email', 'E-mail inválido/inexistente'));
    } else if (!(await checkPassword(password, existingUser))) {
        //Check password match
        errors.push(new FieldMessage('password', 'Senha inválida'));
    }
    
    return errors;
  };

  return validations;
};
