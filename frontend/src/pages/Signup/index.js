import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {
	InputLabel,
	MenuItem,
	Select,
	Stepper,
	Step,
	StepLabel,
	InputAdornment,
	IconButton,
} from "@material-ui/core";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { i18n } from "../../translate/i18n";

import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import logo from "../../assets/logologin.png";
import { documentMask, phoneMask, isValidDocument, removeMask } from "../../utils/masks";
// const Copyright = () => {
// 	return (
// 		<Typography variant="body2" color="textSecondary" align="center">
// 			{"Copyleft "}
// 			<Link color="inherit" href="https://github.com/canove">
// 				Canove
// 			</Link>{" "}
// 			{new Date().getFullYear()}
// 			{"."}
// 		</Typography>
// 	);
// };

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	formContainer: {
		backgroundColor: "#f8f9fa",
		borderRadius: "16px",
		padding: theme.spacing(3),
		marginTop: theme.spacing(2),
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
		border: "1px solid #e9ecef",
		"& .MuiTextField-root": {
			"& .MuiOutlinedInput-root": {
				borderRadius: "12px",
				backgroundColor: "#ffffff",
				"&:hover": {
					backgroundColor: "#ffffff",
				},
				"&.Mui-focused": {
					backgroundColor: "#ffffff",
				},
			},
		},
		"& .MuiSelect-root": {
			borderRadius: "12px",
			backgroundColor: "#ffffff",
		},
	},
	stepperContainer: {
		backgroundColor: "transparent",
		padding: 0,
	},
	planContainer: {
		backgroundColor: "#ffffff",
		borderRadius: "12px",
		padding: theme.spacing(2),
		border: "1px solid #e9ecef",
		marginTop: theme.spacing(1),
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string()
		.min(8, "A senha deve ter pelo menos 8 caracteres")
		.matches(
			/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
			"A senha deve conter pelo menos 1 letra e 1 caractere especial"
		)
		.required("Senha é obrigatória"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], "As senhas devem coincidir")
		.required("Confirmação de senha é obrigatória"),
	email: Yup.string().email("Invalid email").required("Required"),
	fullName: Yup.string()
		.min(2, "Nome muito curto!")
		.max(100, "Nome muito longo!")
		.required("Nome completo é obrigatório"),
	document: Yup.string()
		.required("Documento é obrigatório")
		.test("document-validation", "CPF ou CNPJ inválido", function(value) {
			if (!value) return false;
			return isValidDocument(value);
		}),
	phone: Yup.string()
		.min(10, "Telefone muito curto!")
		.required("Telefone é obrigatório"),
});

const SignUp = () => {
	const classes = useStyles();
	const history = useHistory();
	// Parâmetros da URL podem ser usados futuramente se necessário
	// import qs from 'query-string'
	// const params = qs.parse(window.location.search)
	// const companyId = params.companyId !== undefined ? params.companyId : null;

	const initialState = { 
		name: "", 
		email: "", 
		password: "", 
		confirmPassword: "",
		planId: "", 
		fullName: "",
		document: "",
		phone: ""
	};

	const [user] = useState(initialState);
	const [activeStep, setActiveStep] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const dueDate = moment().add(7, "day").format();
	const trialExpiration = moment().add(7, "day").format(); // Período de teste de 7 dias

	const steps = ['Cadastro', 'Plano'];

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleClickShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const handleClickShowConfirmPassword = () => {
		setShowConfirmPassword(!showConfirmPassword);
	};

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const validateStep = (values, step) => {
		const errors = {};
		
		if (step === 0) {
			// Validações da primeira etapa
			if (!values.fullName) errors.fullName = "Nome completo é obrigatório";
			if (!values.name) errors.name = "Nome da empresa é obrigatório";
			if (!values.email) errors.email = "E-mail é obrigatório";
			if (!values.document) errors.document = "Documento é obrigatório";
			if (!values.phone) errors.phone = "Telefone é obrigatório";
			if (!values.password) errors.password = "Senha é obrigatória";
			if (!values.confirmPassword) errors.confirmPassword = "Confirmação de senha é obrigatória";
			
			if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
				errors.email = "E-mail inválido";
			}
			
			if (values.document && !isValidDocument(values.document)) {
				errors.document = "CPF ou CNPJ inválido";
			}
			
			if (values.password) {
				if (values.password.length < 8) {
					errors.password = "A senha deve ter pelo menos 8 caracteres";
				} else if (!/^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(values.password)) {
					errors.password = "A senha deve conter pelo menos 1 letra e 1 caractere especial";
				}
			}
			
			if (values.confirmPassword && values.password !== values.confirmPassword) {
				errors.confirmPassword = "As senhas devem coincidir";
			}
		} else if (step === 1) {
			// Validações da segunda etapa
			if (!values.planId) errors.planId = "Plano é obrigatório";
		}
		
		return errors;
	};

	const handleSignUp = async (values, actions) => {
		// Remove máscaras dos campos antes de enviar
		const processedValues = {
			...values,
			document: removeMask(values.document),
			phone: removeMask(values.phone),
		};
		
		Object.assign(processedValues, { recurrence: "MENSAL" });
		Object.assign(processedValues, { dueDate: dueDate });
		Object.assign(processedValues, { trialExpiration: trialExpiration });
		Object.assign(processedValues, { status: "t" });
		Object.assign(processedValues, { campaignsEnabled: true });
		try {
			await openApi.post("/companies/cadastro", processedValues);
			toast.success(i18n.t("signup.toasts.success"));
			history.push("/login");
		} catch (err) {
			console.log(err);
			toastError(err);
		}
	};

	const [plans, setPlans] = useState([]);
	const { list: listPlans } = usePlans();

	useEffect(() => {
		async function fetchData() {
			const list = await listPlans();
			setPlans(list);
		}
		fetchData();
	}, [listPlans]);


	return (
		<Container component="main" maxWidth="sm">
			<CssBaseline />
			<div className={classes.paper}>
				<div>
					<img style={{ margin: "0 auto", height: "80px", width: "100%" }} src={logo} alt="Whats" />
				</div>
				<Typography component="h1" variant="h5">
					{i18n.t("signup.title")}
				</Typography>
				
				{/* Stepper */}
				<Stepper activeStep={activeStep} className={classes.stepperContainer} style={{ marginTop: 20, marginBottom: 20 }}>
					{steps.map((label) => (
						<Step key={label}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>

				<div className={classes.formContainer}>
					<Formik
					initialValues={user}
					enableReinitialize={true}
					validate={(values) => validateStep(values, activeStep)}
					onSubmit={(values, actions) => {
						if (activeStep === 0) {
							// Primeira etapa - validar e ir para próxima
							const errors = validateStep(values, 0);
							if (Object.keys(errors).length === 0) {
								handleNext();
							}
							actions.setSubmitting(false);
						} else {
							// Segunda etapa - submeter formulário
							setTimeout(() => {
								handleSignUp(values, actions);
								actions.setSubmitting(false);
							}, 400);
						}
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form className={classes.form}>
							{activeStep === 0 && (
								<Grid container spacing={2}>
									{/* Nome completo - linha toda */}
									<Grid item xs={12}>
										<Field
											as={TextField}
											variant="outlined"
											fullWidth
											name="fullName"
											error={touched.fullName && Boolean(errors.fullName)}
											helperText={touched.fullName && errors.fullName}
											label="Nome Completo"
											id="fullName"
											required
										/>
									</Grid>

									{/* Nome da empresa - E-mail */}
									<Grid item xs={12} sm={6}>
										<Field
											as={TextField}
											autoComplete="name"
											name="name"
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											variant="outlined"
											fullWidth
											id="name"
											label="Nome da Empresa"
											required
										/>
									</Grid>

									<Grid item xs={12} sm={6}>
										<Field
											as={TextField}
											variant="outlined"
											fullWidth
											id="email"
											label={i18n.t("signup.form.email")}
											name="email"
											error={touched.email && Boolean(errors.email)}
											helperText={touched.email && errors.email}
											autoComplete="email"
											required
										/>
									</Grid>

									{/* CPF/CNPJ - Telefone */}
									<Grid item xs={12} sm={6}>
										<Field name="document">
											{({ field }) => (
												<TextField
													{...field}
													variant="outlined"
													fullWidth
													label="CPF/CNPJ"
													error={touched.document && Boolean(errors.document)}
													helperText={touched.document && errors.document}
													placeholder="000.000.000-00 ou 00.000.000/0000-00"
													value={field.value}
													onChange={(e) => {
														const maskedValue = documentMask(e.target.value);
														setFieldValue("document", maskedValue);
													}}
													inputProps={{
														maxLength: 18
													}}
													required
												/>
											)}
										</Field>
									</Grid>

									<Grid item xs={12} sm={6}>
										<Field name="phone">
											{({ field }) => (
												<TextField
													{...field}
													variant="outlined"
													fullWidth
													label="Telefone"
													error={touched.phone && Boolean(errors.phone)}
													helperText={touched.phone && errors.phone}
													placeholder="(11) 99999-9999"
													value={field.value}
													onChange={(e) => {
														const maskedValue = phoneMask(e.target.value);
														setFieldValue("phone", maskedValue);
													}}
													inputProps={{
														maxLength: 15
													}}
													required
												/>
											)}
										</Field>
									</Grid>

									{/* Senha */}
									<Grid item xs={12} sm={6}>
									<Field
									as={TextField}
									variant="outlined"
									fullWidth
									name="password"
									error={touched.password && Boolean(errors.password)}
									helperText={touched.password && errors.password}
									label={i18n.t("signup.form.password")}
									type={showPassword ? 'text' : 'password'}
									id="password"
									autoComplete="new-password"
									required
									InputProps={{
									endAdornment: (
									<InputAdornment position="end">
									<IconButton
									aria-label="toggle password visibility"
									onClick={handleClickShowPassword}
									onMouseDown={handleMouseDownPassword}
									edge="end"
									>
									{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
									</InputAdornment>
									),
									}}
									/>
									</Grid>
									
									{/* Confirmação de Senha */}
									<Grid item xs={12} sm={6}>
									<Field
									as={TextField}
									variant="outlined"
									fullWidth
									name="confirmPassword"
									error={touched.confirmPassword && Boolean(errors.confirmPassword)}
									helperText={touched.confirmPassword && errors.confirmPassword}
									label="Confirmar Senha"
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									autoComplete="new-password"
									required
									InputProps={{
									endAdornment: (
									<InputAdornment position="end">
									<IconButton
									aria-label="toggle confirm password visibility"
									onClick={handleClickShowConfirmPassword}
									onMouseDown={handleMouseDownPassword}
									edge="end"
									>
									{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
									</InputAdornment>
									),
									}}
									/>
									</Grid>
								</Grid>
							)}

							{activeStep === 1 && (
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Typography variant="h6" style={{ marginBottom: 16, textAlign: "center", color: "#495057" }}>
											Escolha seu Plano
										</Typography>
										<div className={classes.planContainer}>
											<InputLabel htmlFor="plan-selection" style={{ marginBottom: 8 }}>Plano</InputLabel>
											<Field
												as={Select}
												variant="outlined"
												fullWidth
												id="plan-selection"
												label="Plano"
												name="planId"
												error={touched.planId && Boolean(errors.planId)}
												required
												style={{ borderRadius: "12px" }}
											>
												{plans.map((plan, key) => (
													<MenuItem key={key} value={plan.id}>
														{plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.value}
													</MenuItem>
												))}
											</Field>
											{touched.planId && errors.planId && (
												<Typography variant="caption" color="error" style={{ marginLeft: 14, marginTop: 8, display: "block" }}>
													{errors.planId}
												</Typography>
											)}
										</div>
									</Grid>
								</Grid>
							)}

							<div style={{ marginTop: 20 }}>
								{activeStep !== 0 && (
									<Button
										onClick={handleBack}
										style={{ marginRight: 8 }}
									>
										Voltar
									</Button>
								)}
								<Button
									type="submit"
									variant="contained"
									color="primary"
									disabled={isSubmitting}
								>
									{activeStep === steps.length - 1 ? i18n.t("signup.buttons.submit") : "Próximo"}
								</Button>
							</div>

							<Grid container justify="flex-end" style={{ marginTop: 16 }}>
								<Grid item>
									<Link
										href="#"
										variant="body2"
										component={RouterLink}
										to="/login"
									>
										{i18n.t("signup.buttons.login")}
									</Link>
								</Grid>
							</Grid>
						</Form>
					)}
					</Formik>
				</div>
			</div>
			<Box mt={5}>{/* <Copyright /> */}</Box>
		</Container>
	);
};

export default SignUp;
